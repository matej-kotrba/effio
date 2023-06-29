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
		isTestValid,
		isValidatInputServer
	} from '~/lib/helpers/test';
	// TODO: Implement isValidInputServer function instead of the local one

	export let data;

	const SECTION_TRANSITION_DURATION = 400;

	initializeNewTestToTestStore({
		title: '',
		description: '',
		errors: {},
		questions: []
	});

	// TODO: Change this back to false
	let testCreationProgress = {
		templateDone: true,
		constructingDone: true,
		detailsDone: false
	};

	let templates: { title: string; image: string }[] = [
		{ title: 'Blank test', image: '/imgs/svgs/empty.svg' }
	];
	let templatesActive: number;

	let finishModal: HTMLDialogElement;

	let isSubmitting = false;
	let isSuccess = false;

	async function postTestToDB(isPublished: boolean) {
		isSubmitting = true;
		try {
			const response = await trpc($page).protected.saveTest.mutate({
				title: $testObject.title,
				description: $testObject.description,
				questionContent: JSON.stringify($testObject.questions),
				isPublished: isPublished
			});
			isSuccess = response.success;
			isSubmitting = false;

			if (isSuccess) {
				goto('/dashboard/test-collection');
			} else {
			}
		} catch (e) {
			console.log(e);
			isSubmitting = false;
		}
	}
</script>

<h2 class="text-h3 font-extralight text-light_text_black">Create your new test</h2>
<p class="text-body1 text-light_text_black_40">
	Choose a template and make a new test using many prebuilt inputs.
</p>
<!-- <button class="p-2 bg-slate-600" on:click={postTestToDB}>Save to db</button> -->
<Space />
<div class="text-sm breadcrumbs">
	<ul>
		<li class="text-light_text_black_80 text-body2" class:done={testCreationProgress.templateDone}>
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
			class="text-light_text_black_80 text-body2"
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
		<li class="text-light_text_black_80 text-body2" class:done={testCreationProgress.detailsDone}>
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
<h3 class="text-h4 text-light_text_black">
	{#if testCreationProgress.templateDone === false}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Start with picking a template</span
		>
	{:else if testCreationProgress.constructingDone === false}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Construct your test</span
		>
	{:else}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>Details</span>
	{/if}
</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="p-2">
	{#if testCreationProgress.templateDone === false}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{ x: -300, duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0 }}
			class=""
		>
			{#each data.templates as template, index}
				<TemplateCard
					title={template.name}
					imageSrc={templates[index].image}
					onClick={() => (templatesActive = index)}
					customClasses={index === templatesActive
						? ' border-light_primary border-4 border-solid shadow-primary shadow-2xl'
						: ' border-transparent border-4 border-solid'}
				/>
			{/each}
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
			out:fly={{ x: -300, duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0 }}
		>
			<Creator inputTemplates={data.questionsTypes} />
			<Space />

			{#if $testObject.questions.length > 0}
				<BasicButton
					title="Continue"
					onClick={async () => {
						// const result = await isValidatInputServer($testObject);
						// $testObject['questions'] = result['obj']['questions'];
						// if (!result['success']) return;
						// testCreationProgress.constructingDone = true;
						const result = isTestValid({
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
			{/if}
		</div>
	{:else}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{ x: -300, duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0 }}
		>
			<div class="flex flex-col gap-4">
				<TextInput
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
				<p
					class={`text-body2 text-error ${$testObject.errors.title ? 'opacity-100' : 'opacity-0'}`}
				>
					{$testObject.errors.title || 'Placeholder error'}
				</p>
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
				<p
					class={`text-body2 text-error ${
						$testObject.errors.description ? 'opacity-100' : 'opacity-0'
					}`}
				>
					{$testObject.errors.description || 'Placeholder error'}
				</p>
				<div class="flex justify-center gap-6 my-4">
					<BasicButton
						onClick={() => {}}
						title={'Preview'}
						class={'bg-white text-light_primary hover:text-white hover:bg-light_primary'}
					/>
					<BasicButton
						onClick={() => {
							finishModal?.showModal();
						}}
						title={'Finish'}
					/>
				</div>
				<dialog bind:this={finishModal} class="modal">
					<form method="dialog" class="relative modal-box bg-light_whiter text-light_text_black">
						<SuccessKeyframe
							successMessage="Success!"
							visible={isSuccess}
							class="absolute top-0 left-0 w-full h-full bg-white"
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
								><Icon icon="ic:round-close" class="absolute text-2xl top-4 right-4" /></button
							>
						</div>
						<h3 class="text-lg font-bold text-center">Finishing your test</h3>
						<Separator w={'80%'} h={'1px'} color={'var(--light-text-black-20)'} />
						<p class="py-4 text-center text-body1">
							Your test named <span class="block font-semibold">{$testObject['title']}</span><Space
								gap={20}
							/> with a description:
							<span class="block font-semibold">{$testObject['description']}</span><br />
							<Separator w={'50%'} h={'1px'} color={'var(--light-text-black-20)'} />
							should be
						</p>
						<div class="flex justify-center gap-3">
							<button
								type="button"
								disabled={isSubmitting}
								class="btn btn-outline text-light_secondary outline-light_primary hover:text-light_primary hover:bg-gray-200"
								on:click={() => postTestToDB(false)}>Saved as draft</button
							>
							<button
								type="button"
								disabled={isSubmitting}
								class="btn bg-light_primary text-light_whiter hover:bg-light_secondary"
								on:click={() => postTestToDB(true)}>Published</button
							>
						</div>
					</form>
				</dialog>
			</div>
		</div>
	{/if}
</div>

<style>
	.done {
		color: var(--light-primary);
	}
</style>
