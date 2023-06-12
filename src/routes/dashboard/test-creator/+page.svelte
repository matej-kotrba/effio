<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { fly, fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import type { QuestionsDataType } from '~components/testCreator/Creator.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import type { TRPCError } from '@trpc/server';

	export let data: PageData;

	const TRANSITION_DURATION = 400;

	// TODO: Change this back to false
	let testCreationProgress = {
		templateDone: true,
		constructingDone: false,
		detailsDone: false
	};

	let templates: { title: string; image: string }[] = [
		{ title: 'Blank test', image: '/imgs/svgs/empty.svg' }
	];
	let templatesActive: number;

	// This object will contain all information associated with the test and will be sent to the DB

	type TestObject = {
		title: string;
		description: string;
		questions: QuestionsDataType[];
	};

	let testObject: TestObject = {
		title: 'This is title',
		description: 'This is description',
		questions: []
	};

	const getQuestionsFromCreatorComponent = (data: CustomEvent<QuestionsDataType[]>) => {
		testObject.questions = data.detail;
	};

	async function postTestToDB() {
		try {
			let data = await trpc($page).protected.saveTest.mutate();
		} catch (e) {
			console.log(e);
		}
	}
</script>

<h2 class="text-h3 font-extralight text-light_text_black">Create your new test</h2>
<p class="text-body1 text-light_text_black_40">
	Choose a template and make a new test using many prebuilt inputs.
</p>
<button class="p-2 bg-slate-600" on:click={postTestToDB}>Save to db</button>
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
			Constructing a test
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
				duration: TRANSITION_DURATION,
				delay: TRANSITION_DURATION
			}}
			out:fly={{ x: -300, duration: $navigating === null ? TRANSITION_DURATION : 0 }}
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
				duration: TRANSITION_DURATION,
				delay: TRANSITION_DURATION
			}}
			out:fly={{ x: -300, duration: $navigating === null ? TRANSITION_DURATION : 0 }}
		>
			<Creator
				inputTemplates={data.questionsTypes}
				on:questionsDataChange={getQuestionsFromCreatorComponent}
			/>
			<Space />

			<BasicButton
				title="Continue"
				onClick={() => {
					testCreationProgress.templateDone = true;
				}}
				buttonAttributes={{ disabled: false }}
			>
				<Icon icon="bxs:right-arrow" class="text-md" />
			</BasicButton>
		</div>
	{:else}
		asd
	{/if}
</div>

<style>
	.done {
		color: var(--light-primary);
	}
</style>
