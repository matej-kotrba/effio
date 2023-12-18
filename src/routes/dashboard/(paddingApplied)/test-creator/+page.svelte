<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import FileImport from '~components/inputs/FileImport.svelte';
	import { fly, fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import { testObject } from '~stores/testObject';
	import {
		initializeNewTestToTestStore,
		isTestValidAndSetErrorsToTestObject
	} from '~/lib/helpers/test';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { transformParsedJSONIntoEffioObject } from '~helpers/parsingGIFT.js';
	import toast from 'svelte-french-toast';

	import ProgressNavigation from '~components/navigation/ProgressNavigation.svelte';
	import ProgrammingCreator from '~components/testCreator/ProgrammingCreator.svelte';
	import TestDetails from './TestDetails.svelte';
	import type { TestType } from '@prisma/client';

	export let data;

	const SECTION_TRANSITION_DURATION = 400;

	initializeNewTestToTestStore({
		title: '',
		description: '',
		errors: {},
		questions: []
	});

	let testCreationProgress = {
		templateDone: true,
		constructingDone: true,
		detailsDone: false
	};

	let templates: { title: string; image: string }[] = [
		{ title: 'Blank', image: '/imgs/svgs/empty.svg' }
	];

	let programmingTemplates: { title: string; image: string }[] = [
		{
			title: 'Blank',
			image: '/imgs/svgs/construction.svg'
		}
	];

	let templatesActive: number | undefined = 0;

	let testType: TestType = 'REGULAR';

	$: ($testObject.questions = []), testType;

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
			console.log(result);
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

	function onTestTypeChangeClick(type: TestType) {
		if (testType === type) return;
		testCreationProgress.templateDone = false;
		testCreationProgress.constructingDone = false;
		testCreationProgress.detailsDone = false;
		testType = type;
		templatesActive = undefined;
	}

	$: canUserContinue = () => {
		if (!Number.isInteger(templatesActive)) return false;
		if (
			testCreationProgress.constructingDone === false &&
			$testObject.questions.length === 0
		)
			return false;
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
	  disabled:bg-gray-300 disabled:text-light_whiter dark:disabled:bg-dark_terciary border-light_primary dark:border-dark_primary hover:bg-light_whiter hover:text-light_terciary
		disabled:dark:text-dark_text_white_40 dark:bg-dark_quaternary dark:hover:bg-dark_secondary dark:hover:text-dark_text_white`}
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
			<div>
				<ProgressNavigation
					defaultActiveIndex={testType === 'REGULAR'
						? 0
						: testType === 'PROGRAMMING'
						? 1
						: -1}
					parts={[
						{
							title: 'Basic test',
							onClick: () => {
								onTestTypeChangeClick('REGULAR');
							}
						},
						{
							title: 'Programming test',
							onClick: () => {
								onTestTypeChangeClick('PROGRAMMING');
							}
						}
					]}
				/>
			</div>
			<Space gap={15} />
			<div class="items-center justify-center xs:justify-start templates-grid">
				{#if testType === 'REGULAR'}
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
				{:else if testType === 'PROGRAMMING'}
					{#each programmingTemplates as template, index}
						<TemplateCard
							title={template.title}
							imageSrc={template.image}
							onClick={() => (templatesActive = index)}
							customClasses={index === templatesActive
								? ' border-light_primary dark:border-dark_primary border-4 border-solid shadow-primary dark:shadow-primary_dark shadow-2xl'
								: ' border-transparent border-4 border-solid'}
						/>
					{/each}
				{/if}
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
			{#if testType === 'REGULAR'}
				<Creator inputTemplates={data.questionTemplates} bind:scrollToInput />
			{:else if testType === 'PROGRAMMING'}
				<ProgrammingCreator programmingTemplate={data.programmingTemplate} />
			{/if}
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
		<TestDetails
			sectionTransitionDuration={SECTION_TRANSITION_DURATION}
			{testType}
		/>
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
