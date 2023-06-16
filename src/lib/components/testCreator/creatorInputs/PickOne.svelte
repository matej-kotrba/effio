<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	export let defaultQuestionsData: PickOneQuestion = {
		answers: [
			{
				answer: ''
			},
			{
				answer: ''
			}
		],
		correctAnswerIndex: 0
	};

	const QUESTION_LIMIT = 10;

	let dispatch = createEventDispatcher();

	// The important thing is the questions array which will be changed in here
	let input: PickOneQuestion = defaultQuestionsData;

	function newQuestionConditionCheck() {
		return !(input.answers.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		input.answers = [...input.answers, { answer: '' }];
	}

	function deleteQuestion(index: number) {
		input.answers = input.answers.filter((_, i) => i !== index);
		if (input['correctAnswerIndex'] === index) input['correctAnswerIndex'] = 0;
		toast.success(`Question ${index + 1} deleted`);
	}

	function sendQuestionDetailsToParent() {
		dispatch('questionDetails', input);
	}

	// TODO: This should be better handled because of performace
	$: sendQuestionDetailsToParent(), input;
</script>

<form class="relative flex flex-col gap-4">
	<!-- Display a limit of the questions -->
	<div class="flex justify-end">
		<div class="flex gap-1">
			{#key input['answers'].length}
				<div
					class={input['answers'].length === QUESTION_LIMIT ? 'text-error' : 'text-light_primary'}
					in:fly={{ x: 0, y: -20 }}
				>
					{input['answers'].length}
				</div>
			{/key}
			/ {QUESTION_LIMIT}
		</div>
	</div>
	{#each input['answers'] as q, index (q)}
		<div class="flex" animate:flip={{ duration: 200 }}>
			<button
				type="button"
				class="group grid place-content-center bg-light_white text-error hover:bg-error hover:text-white rounded-l-md px-2
				 {input['answers'].length > 2
					? 'opacity-100 pointer-events-auto'
					: 'opacity-0 pointer-events-none'}"
				style="transition: 200ms background-color, 200ms color;"
				on:click={() => deleteQuestion(index)}
			>
				<Icon
					icon="material-symbols:close-rounded"
					class="text-3xl group-hover:rotate-90"
					style="transition: 200ms transform;"
				/>
			</button>
			<div class="relative grow-[1]">
				<TextInput
					title="Option {index + 1}"
					titleName="Option {index + 1}"
					bind:inputValue={q.answer}
				/>
			</div>
			<button
				type="button"
				data-tip="Mark this as a correct answer"
				class={`px-2 grid tooltip place-content-center rounded-r-md`}
				style={`${
					index === input['correctAnswerIndex']
						? 'background-color: var(--success); color: var(--light-white);'
						: 'background-color: var(--light-white); color: var(--success);'
				}}`}
				on:click={() => (input['correctAnswerIndex'] = index)}
			>
				<Icon icon="charm:tick" class="text-3xl" />
			</button>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
	<Toaster />
</form>
