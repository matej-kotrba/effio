<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';

	export let exportedQuestion: Question;

	let formRef: HTMLFormElement | null = null;

	// The important thing is the questions array which will be changed in here
	let input: PickOneQuestion = {
		inputType: 'pickOne',
		questions: [
			{
				question: 'Cats are awesome animals 🐱'
			},
			{
				question: 'Seals and sea lions are the best animals (dogs are close tho) 🦭🐶🦭'
			}
		],
		correctAnswerIndex: 1
	};

	function newQuestionConditionCheck() {
		return !(input.questions.length >= 10);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) return;
		input.questions = [...input.questions, { question: '' }];
	}

	function deleteQuestion(index: number) {
		input.questions = input.questions.filter((_, i) => i !== index);
	}
</script>

<form bind:this={formRef} class="relative flex flex-col gap-4">
	{#each input['questions'] as question, index (question)}
		<div class="grid grid-cols-12 duration-200" animate:flip={{ duration: 200 }}>
			<div class="col-span-11">
				<TextInput
					title="Option {index + 1}"
					titleName="Option {index + 1}"
					bind:inputValue={question.question}
				/>
			</div>
			<button
				type="button"
				class="grid col-span-1 place-content-center duration-150 {input['questions'].length > 2
					? 'opacity-100 pointer-events-auto'
					: 'opacity-0 pointer-events-none'}"
				on:click={() => deleteQuestion(index)}
			>
				<Icon icon="material-symbols:close-rounded" class="text-2xl" />
			</button>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
</form>
