<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';

	const QUESTION_LIMIT = 10;

	let formRef: HTMLFormElement | null = null;

	// The important thing is the questions array which will be changed in here
	export let input: PickOneQuestion = {
		inputType: 'pickOne',
		questions: [
			// {
			// 	question: 'Cats are awesome animals 🐱'
			// },
			// {
			// 	question: 'Seals and sea lions are the best animals (dogs are close tho) 🦭🐶🦭'
			// },
			// {
			// 	question: 'Cats are awesome animals 🐱'
			// },
			// {
			// 	question: 'Seals and sea lions are the best animals (dogs are close tho) 🦭🐶🦭'
			// },
			// {
			// 	question: 'Cats are awesome animals 🐱'
			// },
			// {
			// 	question: 'Seals and sea lions are the best animals (dogs are close tho) 🦭🐶🦭'
			// },
			// {
			// 	question: 'Cats are awesome animals 🐱'
			// },
			// {
			// 	question: 'Seals and sea lions are the best animals (dogs are close tho) 🦭🐶🦭'
			// },
			// {
			// 	question: 'Seals and sea lions are the best animals (dogs are close tho) 🦭🐶🦭'
			// }
		],
		correctAnswerIndex: 1
	};

	console.log(input);

	function newQuestionConditionCheck() {
		return !(input.questions.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		input.questions = [...input.questions, { question: '' }];
	}

	function deleteQuestion(index: number) {
		input.questions = input.questions.filter((_, i) => i !== index);
	}
</script>

<form bind:this={formRef} class="relative flex flex-col gap-4">
	<!-- Display a limit of the questions -->
	<div class="flex justify-end">
		<div class="flex gap-1">
			{#key input['questions']}
				<div
					class={input['questions'].length === QUESTION_LIMIT ? 'text-error' : 'text-light_primary'}
					in:fly={{ x: 0, y: -20 }}
				>
					{input['questions'].length}
				</div>
			{/key}
			/ {QUESTION_LIMIT}
		</div>
	</div>
	{#each input['questions'] as q, index (q)}
		<div class="grid grid-cols-12 duration-200" animate:flip={{ duration: 200 }}>
			<div class="col-span-11">
				<TextInput
					title="Option {index + 1}"
					titleName="Option {index + 1}"
					bind:inputValue={q.question}
				/>
			</div>
			<button
				type="button"
				class="group grid col-span-1 place-content-center duration-150 bg-light_quaternary rounded-r-full
				 {input['questions'].length > 2
					? 'opacity-100 pointer-events-auto'
					: 'opacity-0 pointer-events-none'}"
				on:click={() => deleteQuestion(index)}
			>
				<Icon
					icon="material-symbols:close-rounded"
					class="text-3xl duration-200 group-hover:rotate-90"
				/>
			</button>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
	<Toaster />
</form>
