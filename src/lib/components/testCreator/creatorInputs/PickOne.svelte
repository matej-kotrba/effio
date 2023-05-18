<script lang="ts">
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { blur } from 'svelte/transition';

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

	function onAddNew() {
		input.questions.push({
			question: ''
		});
	}
</script>

<form bind:this={formRef} class="relative flex flex-col gap-4">
	{#each input['questions'] as { question }, index}
		<div transition:blur>
			<TextInput
				title="Option {index + 1}"
				titleName="Option {index + 1}"
				bind:inputValue={question}
			/>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
</form>
