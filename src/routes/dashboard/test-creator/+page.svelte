<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import TextInput from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import { fly, fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import type { QuestionsDataType } from '~components/testCreator/Creator.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';

	export let data: PageData;

	const TRANSITION_DURATION = 400;

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

	// This object will contain all information associated with the test and will be sent to the DB

	type TestObject = {
		title: string;
		description: string;
		questions: QuestionsDataType[];
	};

	let testObject: TestObject = {
		title: 'This is title',
		description: 'This is description',
		questions: [
			{
				id: crypto.randomUUID(),
				title: 'What is the capital of France?',
				displayType: 'Pick one',
				questionType: 'pickOne',
				questionTypeId: 'edec0330-59a3-45a9-a932-599ccf3c9fe8',
				content: {
					correctAnswerIndex: 1,
					questions: [
						{
							question: 'Paris'
						},
						{
							question: 'Paris'
						},
						{
							question: 'Paris'
						}
					]
				}
			},
			{
				id: crypto.randomUUID(),
				title: 'What facts about Earh are true ?',
				displayType: 'True/False',
				questionType: 'true/false',
				questionTypeId: '6100faf8-8f10-415d-92cd-e908828bcc25',
				content: {
					questions: [
						{
							isTrue: false,
							question: 'Is the earth flat?'
						}
					]
				}
			}
		]
	};

	const setQuestionsFromCreatorComponent = (data: CustomEvent<QuestionsDataType[]>) => {
		testObject.questions = data.detail;
	};

	async function postTestToDB() {
		try {
			await trpc($page).protected.saveTest.mutate({
				title: testObject.title,
				description: testObject.description,
				questionContent: JSON.stringify(testObject.questions)
			});
		} catch (e) {
			console.log(e);
		}
	}

	$: console.log(testObject.title);
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
				initialData={testObject.questions}
				on:questionsDataChange={setQuestionsFromCreatorComponent}
			/>
			<Space />

			<BasicButton
				title="Continue"
				onClick={() => {
					testCreationProgress.constructingDone = true;
				}}
				buttonAttributes={{ disabled: false }}
			>
				<Icon icon="bxs:right-arrow" class="text-md" />
			</BasicButton>
		</div>
	{:else}
		<div
			in:fly={{
				x: 300,
				duration: TRANSITION_DURATION,
				delay: TRANSITION_DURATION
			}}
			out:fly={{ x: -300, duration: $navigating === null ? TRANSITION_DURATION : 0 }}
		>
			<div class="flex flex-col gap-4">
				<TextInput
					title="What will be the name of your test?"
					titleName="name"
					inputValue={testObject['title']}
					on:inputChange={(data) => {
						testObject['title'] = data.detail;
					}}
				/>
				<TextAreaInput
					title="Describe what will you test be about."
					titleName="name"
					inputValue={testObject['description']}
					on:inputChange={(data) => {
						testObject['description'] = data.detail;
					}}
				/>
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
					<form method="dialog" class="modal-box bg-light_whiter text-light_text_black">
						<h3 class="text-lg font-bold">Finishing your test</h3>
						<p class="py-4">Press ESC key or click the button below to close</p>
						<div class="modal-action">
							<!-- if there is a button in form, it will close the modal -->
							<button class="btn">Close</button>
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
