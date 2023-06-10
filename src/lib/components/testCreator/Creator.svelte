<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clickOutside } from '~use/clickOutside';
	import Input from '~components/testCreator/Input.svelte';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	type NewQuestionInput = {
		id: string;
		questionType: Question['questionType'];
		displayType: QuestionTemplate['name'];
		content?: undefined;
		title?: undefined;
	};

	type QuestionsDataType = Question | NewQuestionInput;

	// Variable which stores all the inputs and display them in the dropdown (usually fetch this from the database)
	export let inputTemplates: QuestionTemplate[] = [];

	// Dropdown state
	let openDropdown = false;

	// Ensuring that the draggable inputs are not draggable when the user doesnt use the specific area
	let dragDisable: boolean = true;

	// Stores the data of questions created, from this then will be created JSON which will be sent to the DB ❗
	// The questionsDataType can contain questions or blank object so its ready for input
	let questionsData: QuestionsDataType[] = [
		{
			id: crypto.randomUUID(),
			title: 'What is the capital of France?',
			displayType: 'Pick one',
			questionType: 'pickOne',
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
			content: {
				questions: [
					{
						isTrue: false,
						question: 'Is the earth flat?'
					}
				]
			}
		}
	];

	function addNewQuestion(input: NewQuestionInput) {
		questionsData = [...questionsData, input];
	}

	function removeQuestion(index: number) {
		questionsData = questionsData.filter((_, i) => i !== index);
	}

	function onDropdownInputClick(input: QuestionTemplate) {
		addNewQuestion({
			id: crypto.randomUUID(),
			questionType: input.properties.inputType as Question['questionType'],
			displayType: input.name
		});
		openDropdown = false;
	}

	function onOrderChange(e: { detail: { items: QuestionsDataType[]; info: { source: any } } }) {
		questionsData = e.detail.items;
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisable = true;
		}
	}

	function onOrderConsideration(e: { detail: { items: QuestionsDataType[] } }) {
		questionsData = e.detail.items;
	}

	function startDrag(e: Event) {
		e.preventDefault();
		dragDisable = false;
	}

	// $: console.log(questionsData);
</script>

<div class="p-4 bg-light_white roudned-md text-light_text_black">
	<div class="relative flex flex-col items-center justify-center gap-2">
		<div
			class="flex flex-col w-full gap-3 lg:w-3/4 xl:w-2/3"
			use:dndzone={{
				items: questionsData,
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
			{#each questionsData as question, index (question['id'])}
				<!-- Div which needs to be here for draggeble to be in creator and not in input -->
				<div animate:flip={{ duration: 300 }}>
					<Input
						input={{
							questionType: question.questionType,
							title: questionsData[index]['title'],
							content: questionsData[index]['content'],
							displayType: question.displayType
						}}
						on:questionDetails={({ detail }) => {
							questionsData[index]['content'] = detail;
						}}
						on:titleDetails={({ detail }) => {
							questionsData[index]['title'] = detail;
						}}
						on:deleteInput={() => removeQuestion(index)}
						on:dnddrag={startDrag}
					/>
					<!-- The dropdown for new input -->
					<div
						class="relative flex flex-row items-center w-full gap-4 px-4 mt-4 duration-150 group opacity-20 hover:opacity-100"
						on:mouseleave={() => (openDropdown = false)}
					>
						<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
						<button
							type="button"
							class="relative z-10 w-24 p-2 duration-200 rounded-full aspect-square bg-light_terciary text-whiter hover:bg-light_secondary"
							on:click={() => (openDropdown = !openDropdown)}
						>
							<Icon icon="ic:round-plus" class="mx-auto text-3xl rounded-lg text-light_white" />
						</button>
						<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
						<div
							use:clickOutside
							on:clickoutside={() => (openDropdown = false)}
							class="absolute right-0 w-full grid_layout gap-4 p-4 absoluteContainer z-30
				rounded-md shadow-lg bottom-[calc(100%-5px)] bg-light_whiter duration-200 opacity-0
				{openDropdown ? 'group-hover:opacity-100 hover:opacity-100' : 'opacity-0'}"
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
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.grid_layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		overflow-y: scroll;
		max-height: 250px;
	}

	/* width */
	.absoluteContainer::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	.absoluteContainer::-webkit-scrollbar-track {
		background: var(--light-text-black-20);
		border-radius: 50px;
	}

	/* Handle */
	.absoluteContainer::-webkit-scrollbar-thumb {
		background: var(--light-terciary);
		border-radius: 50px;
	}

	/* Handle on hover */
	.absoluteContainer::-webkit-scrollbar-thumb:hover {
		background: var(--light-secondary);
	}
</style>
