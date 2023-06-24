<!-- <script lang="ts" context="module">
	type NewQuestionInput = {
		id: string;
		displayType: QuestionTemplate['name'];
		questionType: Question['questionType'];
		questionTypeId: string;
		content: Question['content'];
		title?: string;
		errors: {
			[key: string]: string;
		};
	};

	export type QuestionsDataType = Question | NewQuestionInput;
</script> -->

<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clickOutside } from '~use/clickOutside';
	import Input from '~components/testCreator/Input.svelte';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { dndzone, SOURCES } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { testObject } from '~stores/testObject';
	import TrueFalse from './creatorInputs/TrueFalse.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Space from '~components/separators/Space.svelte';

	// Variable which stores all the inputs and display them in the dropdown (usually fetch this from the database)
	export let inputTemplates: QuestionTemplate[] = [];

	// Dropdown state
	let isDropdownOpen = false;
	let newInputModal: HTMLDialogElement;

	// Ensuring that the draggable inputs are not draggable when the user doesnt use the specific area
	let dragDisable: boolean = true;

	// THE STORE DOES IT NOW -> Stores the data of questions created, from this then will be created JSON which will be sent to the DB ❗
	// The questionsDataType can contain questions or blank object so its ready for input

	function addNewQuestion(input: Question) {
		$testObject.questions = [...$testObject.questions, input];
	}

	function removeQuestion(index: number) {
		$testObject.questions = $testObject.questions.filter((_, i) => i !== index);
	}

	function onNewInputClick(input: QuestionTemplate) {
		let newQuestionData: PartialPick<Question, 'content'> = {
			id: crypto.randomUUID(),
			title: '',
			questionType: input.properties.inputType as Question['questionType'],
			displayType: input.name,
			questionTypeId: input.id,
			errors: {}
		};

		let questionType = input.properties.inputType as Question['questionType'];

		if (questionType === 'pickOne') {
			newQuestionData.content = {
				type: 'pickOne',
				correctAnswerIndex: 0,
				answers: [
					{
						answer: ''
					},
					{
						answer: ''
					}
				]
			} as PickOneQuestion;
		} else if (questionType === 'true/false') {
			newQuestionData.content = {
				type: 'true/false',
				answers: [
					{
						answer: '',
						isTrue: false
					},
					{
						answer: '',
						isTrue: false
					}
				]
			} as TrueFalseQuestion;
		} else {
			console.error('This question type is not supported!');
			return;
		}

		newInputModal.close();
		addNewQuestion(newQuestionData as Question);
		isDropdownOpen = false;
	}

	function onOrderChange(e: { detail: { items: Question[]; info: { source: any } } }) {
		$testObject.questions = e.detail.items;
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisable = true;
		}
	}

	function onOrderConsideration(e: { detail: { items: Question[] } }) {
		$testObject.questions = e.detail.items;
	}

	function startDrag(e: Event) {
		e.preventDefault();
		dragDisable = false;
	}

	// $: {
	// 	dispatch('questionsDataChange', questionsData);
	// }

	// onMount(() => {
	// 	questionsData = initialData;
	// });

	// $: questionsData = initialData;
	// $: console.log(questionsData);
</script>

<div class="p-4 bg-light_white roudned-md text-light_text_black">
	<!-- The dropdown for new input -->
	<dialog class="modal" bind:this={newInputModal}>
		<form method="dialog" class="modal-box max-w-[1000px] bg-light_whiter">
			<h3 class="text-lg font-bold text-light_text_black">Pick new input for your test!</h3>
			<Space gap={20} />
			<div class="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each inputTemplates as input}
					<button
						type="button"
						on:click={() => onNewInputClick(input)}
						class="bg-white rounded-lg shadow-lg aspect-square new-input-button"
					>
						<span class="text-light_text_black">{input.name}</span>
					</button>
				{/each}
			</div>
		</form>
		<form method="dialog" class="modal-backdrop">
			<button class="cursor-default">close</button>
		</form>
	</dialog>
	<!-- <div
							class="relative flex flex-row items-center w-full gap-4 px-4 mt-4 duration-150 group opacity-20 hover:opacity-100"
							on:mouseleave={() => (isDropdownOpen = false)}
						>
							<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
							<button
								type="button"
								class="relative z-10 w-24 p-2 duration-200 rounded-full aspect-square bg-light_terciary text-whiter hover:bg-light_secondary"
								on:click={() => (isDropdownOpen = !isDropdownOpen)}
							>
								<Icon icon="ic:round-plus" class="mx-auto text-3xl rounded-lg text-light_white" />
							</button>
							<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
							<div
								use:clickOutside
								on:clickoutside={() => (isDropdownOpen = false)}
								class="absolute right-0 w-full grid_layout gap-4 p-4 absoluteContainer z-30
						rounded-md shadow-lg bottom-[calc(100%-5px)] bg-light_whiter duration-200 opacity-0
						{isDropdownOpen ? 'group-hover:opacity-100 hover:opacity-100' : 'opacity-0 pointer-events-none'}"
							>
								{#each inputTemplates as input}
									<button
										type="button"
										on:click={() => onDropdownInputClick(input)}
										class="grid w-full rounded-md aspect-square text-light_whiter bg-light_primary place-content-center"
									>
										{input.name}
									</button>
								{/each}
							</div>
						</div> -->
	<div class="relative flex flex-col items-center justify-center gap-2">
		<!-- Displaying the initial create button -->
		{#if $testObject.questions.length === 0}
			<div class="flex flex-col items-center gap-3">
				<h4 class="font-semibold text-h6 text-light_text_black">Start with the first question!</h4>
				<div class="grid grid-cols-2 grid-rows-2">
					<img
						src="/imgs/svgs/piece.svg"
						width="500"
						class="max-w-[500px] min-w-[150px] col-start-1 row-start-1 col-span-2 row-span-2"
						alt=""
					/>
					<div class="grid col-start-2 row-start-2 place-content-center">
						<BasicButton onClick={() => newInputModal?.showModal()} title="Add question" />
					</div>
				</div>
			</div>
		{:else}
			<div
				class="flex flex-col w-full gap-3 lg:w-3/4 xl:w-2/3"
				use:dndzone={{
					items: $testObject['questions'],
					flipDurationMs: 300,
					dragDisabled: dragDisable,
					dropTargetClasses: ['outline-light_primary', 'outline-solid', 'rounded-md'],
					dropTargetStyle: {
						outline: '2px dashed var(--light-primary)'
					}
				}}
				on:finalize={onOrderChange}
				on:consider={onOrderConsideration}
			>
				<!-- Separator with add new input -->
				{#each $testObject['questions'] as question, index (question['id'])}
					<!-- Div which needs to be here for draggeble to be in creator and not in input -->
					<div animate:flip={{ duration: 300 }}>
						<Input
							{index}
							on:questionDetails={({ detail }) => {
								$testObject.questions[index]['content'] = detail;
							}}
							on:titleChange={({ detail }) => {
								$testObject.questions[index]['title'] = detail;
							}}
							on:deleteInput={() => removeQuestion(index)}
							on:dnddrag={startDrag}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.new-input-button {
		background-image: radial-gradient(ellipse at 50% 0, white 60%, var(--light-primary) 300%);
		transition: 0.4s ease;
	}

	.new-input-button:hover {
		transform: translateY(-5px);
	}

	/* .grid_layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		overflow-y: scroll;
		max-height: 250px;
	} */

	/* width */
	/* .absoluteContainer::-webkit-scrollbar {
		width: 10px; */
	/* } */

	/* Track */
	/* .absoluteContainer::-webkit-scrollbar-track {
		background: var(--light-text-black-20);
		border-radius: 50px;
	} */

	/* Handle */
	/* .absoluteContainer::-webkit-scrollbar-thumb {
		background: var(--light-terciary);
		border-radius: 50px;
	} */

	/* Handle on hover */
	/* .absoluteContainer::-webkit-scrollbar-thumb:hover {
		background: var(--light-secondary);
	} */
</style>
