<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Skewed from '~components/loaders/Skewed.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import TextInput from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import FileImport from '~components/inputs/FileImport.svelte';
	import { fly, fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { testObject } from '~stores/testObject';
	import {
		DESCRIPTION_MAX,
		DESCRIPTION_MIN,
		TITLE_MAX,
		TITLE_MIN,
		descriptionSchema,
		titleSchema
	} from '~schemas/textInput';
	import {
		initializeNewTestToTestStore,
		isTestValidAndSetErrorsToTestObject,
		isValidInputServerAndSetErrorsToTestObject
	} from '~/lib/helpers/test';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { transformParsedJSONIntoEffioObject } from '~helpers/parsingGIFT.js';
	import toast from 'svelte-french-toast';
	import MarkSystem from '~components/testCreator/creatorUtils/MarkSystem.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import GroupSelection from '~components/testCreator/creatorUtils/GroupSelection.svelte';
	import { createTRPCErrorNotification } from '~/lib/utils/notification.js';
	import { TRPCClientError } from '@trpc/client';
	import { validateTestAndRecordIt } from '~helpers/testGroupCalls.js';
	import ImageImport from '~components/inputs/ImageImport.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';

	export let data;

	const SECTION_TRANSITION_DURATION = 400;

	initializeNewTestToTestStore({
		title: '',
		description: '',
		errors: {},
		questions: []
	});

	let testCreationProgress = {
		templateDone: false,
		constructingDone: false,
		detailsDone: false
	};

	let templates: { title: string; image: string }[] = [
		{ title: 'Blank', image: '/imgs/svgs/empty.svg' }
	];

	let templatesActive: number;

	let finishModal: HTMLDialogElement;
	let testImageFile: File | undefined = undefined;

	let isSubmitting = false;
	let isSuccess = false;

	async function checkTestOnClientAndServerAndPostTestToDB(
		isPublished: boolean
	) {
		if (isSubmitting) return;
		isSubmitting = true;

		await validateTestAndRecordIt({
			type: 'create',
			data: {
				title: $testObject.title,
				description: $testObject.description,
				questions: $testObject.questions,
				markSystem: $testObject.markSystem,
				isPublished: isPublished,
				image: testImageFile
			},
			callbacks: {
				onSaveToDB(response) {
					isSuccess = response.success;
					isSubmitting = false;

					if (isSuccess) {
						goto('/dashboard/test-collection');
					}
				},
				onErrorSaveToDB(e) {
					if (e instanceof TRPCClientError) {
						createTRPCErrorNotification(e);
					}
					isSubmitting = false;
				}
			}
		});
		// const result = isTestValidAndSetErrorsToTestObject({
		// 	title: $testObject.title,
		// 	description: $testObject.description,
		// 	questions: $testObject.questions,
		// 	markSystem: $testObject.markSystem
		// });

		// if (result['isError']) {
		// 	$testObject.errors = result['store']['errors'];
		// 	return;
		// }

		// const serverResponse = await isValidInputServerAndSetErrorsToTestObject({
		// 	title: $testObject.title,
		// 	description: $testObject.description,
		// 	questions: $testObject.questions,
		// 	markSystem: $testObject.markSystem
		// });

		// if (serverResponse.isError === true) {
		// 	$testObject.errors = result['store']['errors'];
		// 	return;
		// }

		// try {
		// 	const response = await trpc($page).protected.saveTest.mutate({
		// 		title: $testObject.title,
		// 		description: $testObject.description,
		// 		questionContent: JSON.stringify($testObject.questions),
		// 		isPublished: isPublished,
		// 		markSystem: $testObject.markSystem?.marks
		// 			? {
		// 					marks: $testObject.markSystem.marks.map((item) => {
		// 						return {
		// 							name: item.name,
		// 							// Checked in the isTestValidAndSetErrorsToTestObject
		// 							limit: item.limit as number
		// 						};
		// 					})
		// 			  }
		// 			: undefined,
		// 		includedInGroups: $testObject.includedInGroups
		// 	});
		// 	// console.log('RESPONSE', response);
		// 	isSuccess = response.success;
		// 	isSubmitting = false;

		// 	if (isSuccess) {
		// 		goto('/dashboard/test-collection');
		// 	} else {
		// 	}
		// } catch (e) {
		// 	if (e instanceof TRPCClientError) {
		// 		createTRPCErrorNotification(e);
		// 	}
		// 	isSubmitting = false;
		// }
	}

	function handleParsedData(e: CustomEvent) {
		console.log(e.detail);
		try {
			const questions = transformParsedJSONIntoEffioObject(
				e.detail,
				data.questionTemplates
			);

			if (questions.length === 0) {
				toast.error('This import file seems empty or incorrect 😕');
			}

			$testObject.questions = questions;

			testCreationProgress.templateDone = true;
		} catch (e) {
			console.log(e);
		}
	}

	async function onNavigationButtonClick() {
		if (canUserContinue() === false) return;

		if (testCreationProgress.templateDone === false) {
			testCreationProgress.templateDone = true;
		} else if (testCreationProgress.constructingDone === false) {
			const result = isTestValidAndSetErrorsToTestObject({
				questions: $testObject.questions
			});
			// if (result['store']['questions_errors']) {
			// 	result.store.questions_errors.forEach((item, index) => {
			// 		$testObject.questions[index].errors = item;
			// 	});
			// }

			$testObject = $testObject;
			if (result['isError']) {
				// console.log(result.store);
				// if (result.store?.questions_errors) {
				// 	const firstErrorIndex = result['store']['questions_errors'].findIndex(
				// 		(item) => {
				// 			return (
				// 				Object.entries(item).reduce((acc, [_, value]) => {
				// 					if (value) return acc + 1;
				// 					return acc;
				// 				}, 0) > 0
				// 			);
				// 		}
				// 	);
				// 	console.log(firstErrorIndex);
				// }
				toast.error(
					result['message'] ||
						'Something with validating your test went wrong 😕'
				);
				return;
			}
			testCreationProgress.constructingDone = true;
		}
	}

	$: canUserContinue = () => {
		if (!Number.isInteger(templatesActive)) return false;
		return true;
	};

	// Function to scroll on error to specific input
	let scrollToInput: ((index: number) => void) | undefined = undefined;
</script>

<!-- <BasicButton
				title="Continue"
				onClick={() => {
					testCreationProgress.templateDone = true;
				}}
				buttonAttributes={{ disabled: !Number.isInteger(templatesActive) }}
			>
				<Icon icon="bxs:right-arrow" class="text-md" />
			</BasicButton>
			<BasicButton
					title="Continue"
					onClick={async () => {
						// const result = await isValidatInputServer($testObject);
						// $testObject['questions'] = result['obj']['questions'];
						// if (!result['success']) return;
						// testCreationProgress.constructingDone = true;

						const result = isTestValidAndSetErrorsToTestObject({
							questions: $testObject.questions
						});

						if (result['store']['questions']) {
							$testObject['questions'] = result['store']['questions'];
						}

						$testObject = $testObject;
						if (result['isError']) return;
						testCreationProgress.constructingDone = true;
					}}
					buttonAttributes={{ disabled: false }}
				>
					<Icon icon="bxs:right-arrow" class="text-md" />
				</BasicButton> -->
<DashboardTitle
	title="Create your new test"
	subtitle="Choose a template and make a new test using many prebuilt inputs."
/>

{#if testCreationProgress.templateDone === true && testCreationProgress.constructingDone === false}
	<div
		transition:fly={{ x: 200 }}
		class={`fixed grid place-content-center z-10
	 shadow-md bottom-2 md:bottom-6 right-2 md:right-6 
		`}
	>
		<!-- <span class="font-semibold text-h5"> Continue </span> -->
		<!-- <iconify-icon icon="iconamoon:arrow-right-6-circle-thin" class="text-4xl" /> -->
		<button
			type="button"
			on:click={onNavigationButtonClick}
			disabled={!canUserContinue()}
			class={`group grid place-content-center p-1 duration-150 border-2 border-solid rounded-lg md:p-3 bg-light_terciary text-light_whiter
	  disabled:bg-gray-300 disabled:text-light_whiter border-light_terciary hover:bg-light_whiter hover:text-light_terciary`}
		>
			<!-- <div
			class="w-[150%] aspect-square rounded-lg bg-light_grey scale-0 group-disabled:scale-0 group-hover:scale-100 duration-150 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"
		/> -->
			<iconify-icon icon="iconamoon:arrow-right-2-duotone" class="text-5xl" />
		</button>
	</div>
{/if}

<div class="max-w-[98vw] text-sm breadcrumbs">
	<ul class="">
		<li
			class="text-light_text_black dark:text-dark_text_white text-body2"
			class:done={testCreationProgress.templateDone}
		>
			<button
				type="button"
				on:click={() => {
					testCreationProgress.templateDone = false;
					testCreationProgress.constructingDone = false;
					testCreationProgress.detailsDone = false;
				}}>Picking a template</button
			>
		</li>
		<li
			class="text-light_text_black dark:text-dark_text_white text-body2"
			class:done={testCreationProgress.constructingDone}
		>
			<button
				type="button"
				on:click={() => {
					if (testCreationProgress.templateDone === false) return;
					testCreationProgress.templateDone = true;
					testCreationProgress.constructingDone = false;
					testCreationProgress.detailsDone = false;
				}}>Constructing a test</button
			>
		</li>
		<li
			class="text-light_text_black dark:text-dark_text_white text-body2"
			class:done={testCreationProgress.detailsDone}
		>
			Details
		</li>
	</ul>
</div>
<!-- <ProgressNavigation
	parts={[
		{ title: 'Picking a template', onClick: () => {}, buttonProps: { disabled: false } },
		{ title: 'Constructing a test', onClick: () => {}, buttonProps: { disabled: true } },
		{ title: 'Details', onClick: () => {}, buttonProps: { disabled: true } }
	]}
	color={'var(--light-primary)'}
/> -->
<h3 class="text-h5 md:text-h4 text-light_text_black dark:text-dark_text_white">
	{#if testCreationProgress.templateDone === false}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Start with picking a template</span
		>
	{:else if testCreationProgress.constructingDone === false}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Construct your test</span
		>
	{:else}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Details</span
		>
	{/if}
</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="p-1 sm:p-2 @container">
	{#if testCreationProgress.templateDone === false}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{
				x: -300,
				duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
			}}
			class=""
		>
			<div class="items-center justify-center xs:justify-start templates-grid">
				{#each templates as template, index}
					<TemplateCard
						title={template.title}
						imageSrc={templates[index].image}
						onClick={() => (templatesActive = index)}
						customClasses={index === templatesActive
							? ' border-light_primary dark:border-dark_primary border-4 border-solid shadow-primary dark:shadow-primary_dark shadow-2xl'
							: ' border-transparent border-4 border-solid'}
					/>
				{/each}
				<FileImport
					on:parsedFile={handleParsedData}
					additionalText={'In GIFT format'}
				/>
			</div>
			<Space />

			<BasicButton
				title="Continue"
				onClick={() => {
					testCreationProgress.templateDone = true;
				}}
				buttonAttributes={{ disabled: !Number.isInteger(templatesActive) }}
			>
				<Icon icon="bxs:right-arrow" class="text-md" />
			</BasicButton>
		</div>
		<!-- Else if  -->
	{:else if testCreationProgress.constructingDone === false}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{
				x: -300,
				duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
			}}
		>
			<Creator inputTemplates={data.questionsTypes} bind:scrollToInput />
			<Space />

			<!-- {#if $testObject.questions.length > 0}
				<BasicButton
					title="Continue"
					onClick={async () => {
						// const result = await isValidatInputServer($testObject);
						// $testObject['questions'] = result['obj']['questions'];
						// if (!result['success']) return;
						// testCreationProgress.constructingDone = true;

						const result = isTestValidAndSetErrorsToTestObject({
							questions: $testObject.questions
						});

						if (result['store']['questions']) {
							$testObject['questions'] = result['store']['questions'];
						}

						$testObject = $testObject;
						if (result['isError']) return;
						testCreationProgress.constructingDone = true;
					}}
					buttonAttributes={{ disabled: false }}
				>
					<Icon icon="bxs:right-arrow" class="text-md" />
				</BasicButton>
			{/if} -->
		</div>
	{:else}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{
				x: -300,
				duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
			}}
		>
			<div class="flex flex-col gap-4">
				<ErrorEnhance error={$testObject.errors.title}>
					<TextInput
						displayOutside={true}
						title="What will be the name of your test?"
						titleName="name"
						inputValue={$testObject['title']}
						validationSchema={titleSchema}
						max={TITLE_MAX}
						min={TITLE_MIN}
						on:inputChange={(data) => {
							$testObject['title'] = data.detail;
						}}
						on:error={(data) => {
							$testObject.errors.title = data.detail;
						}}
					/>
				</ErrorEnhance>

				<div class="flex gap-4">
					<div class="w-full">
						<ErrorEnhance error={$testObject.errors.description}>
							<TextAreaInput
								title="Describe what will your test be about."
								titleName="name"
								inputValue={$testObject['description']}
								validationSchema={descriptionSchema}
								min={DESCRIPTION_MIN}
								max={DESCRIPTION_MAX}
								on:inputChange={(data) => {
									$testObject['description'] = data.detail;
								}}
								on:error={(data) => {
									$testObject.errors.description = data.detail;
								}}
							/>
						</ErrorEnhance>
					</div>
					<ImageImport title="Test photo" bind:exportedFile={testImageFile} />
				</div>
				<div class="flex justify-end">
					<GroupSelection />
				</div>
				<MarkSystem />
				<div class="flex justify-center gap-6 my-4">
					<BasicButton
						onClick={() => {}}
						title={'Preview'}
						class={'bg-white text-light_primary hover:text-white hover:bg-light_primary'}
					/>
					<BasicButton
						onClick={() => {
							const result = isTestValidAndSetErrorsToTestObject({
								title: $testObject.title,
								description: $testObject.description,
								questions: $testObject.questions,
								markSystem: $testObject.markSystem
							});

							if (result['isError']) {
								$testObject.errors = result['store']['errors'];
								return;
							}
							finishModal?.showModal();
						}}
						title={'Finish'}
					/>
				</div>
				<dialog bind:this={finishModal} class="modal">
					<form
						method="dialog"
						class="relative modal-box bg-light_whiter dark:bg-dark_grey text-light_text_black dark:text-dark_text_white"
					>
						<SuccessKeyframe
							successMessage="Success!"
							visible={isSuccess}
							class="absolute top-0 left-0 w-full h-full bg-white dark:bg-dark_grey"
						/>
						<div
							class="bg-light_text_black_40 absolute inset-0 grid place-content-center duration-150 {isSubmitting
								? 'opacity-100 pointer-events-auto'
								: 'opacity-0 pointer-events-none'}"
						>
							<Skewed />
						</div>
						<div class="modal-action">
							<button type="button" on:click={() => finishModal.close()}
								><Icon
									icon="ic:round-close"
									class="absolute text-2xl top-4 right-4"
								/></button
							>
						</div>
						<h3 class="text-lg font-bold text-center">Finishing your test</h3>
						<Separator
							w={'80%'}
							h={'1px'}
							color={$applicationStates['darkMode']
								? 'var(--dark-text-white-20)'
								: 'var(--light-text-black-20)'}
						/>
						<p class="py-4 text-center text-body1">
							Your test named <span class="block font-semibold"
								>{$testObject['title']}</span
							><Space gap={20} /> with a description:
							<span class="block font-semibold"
								>{$testObject['description']}</span
							><br />
							<Separator
								w={'50%'}
								h={'1px'}
								color={$applicationStates['darkMode']
									? 'var(--dark-text-white-20)'
									: 'var(--light-text-black-20)'}
							/>
							should be
						</p>
						<div class="flex justify-center gap-3">
							<button
								type="button"
								disabled={isSubmitting}
								class="btn btn-outline text-light_secondary dark:text-dark_primary outline-light_primary dark:outline-dark_primary hover:text-light_primary dark:hover:text-dark_primary hover:bg-gray-200 dark:hover:bg-dark_light_grey"
								on:click={() =>
									checkTestOnClientAndServerAndPostTestToDB(false)}
								>Saved as draft</button
							>
							<button
								type="button"
								disabled={isSubmitting}
								class="btn bg-light_primary dark:bg-dark_primary text-light_whiter hover:bg-light_secondary dark:hover:bg-dark_primary_light"
								on:click={() => checkTestOnClientAndServerAndPostTestToDB(true)}
								>Published</button
							>
						</div>
					</form>
				</dialog>
			</div>
		</div>
	{/if}
</div>

<style>
	.templates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 250px));
		gap: 16px;
	}

	@container (max-width: 768px) {
		.templates-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 200px));
		}
	}

	@container (max-width: 420px) {
		.templates-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 150px));
		}
	}

	.done {
		color: var(--light-primary);
	}

	:global(.dark) .done {
		color: var(--dark-primary);
	}
</style>
