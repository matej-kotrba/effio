<script lang="ts">
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<PickOneQuestion> | null =
		null;

	console.log(resultFormat);

	let selectedInput: number = (
		$testObject.questions[questionIndex]['content'] as PickOneQuestion
	)['correctAnswerIndex'];

	// Update the store based on the selection
	$: ($testObject.questions[questionIndex]['content'] as PickOneQuestion)[
		'correctAnswerIndex'
	] = selectedInput;

	// Update the selectedInput based on the resultFormat
	$: {
		if (resultFormat) {
			selectedInput = resultFormat.userAnswer.correctAnswerIndex;
		}
		console.log(selectedInput);
	}
</script>

<div class="flex flex-col gap-2">
	{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
		<button
			type="button"
			disabled={!!resultFormat}
			on:click|self={() => (selectedInput = index)}
			class="flex justify-between px-6 py-3 duration-100 rounded-md shadow-md {resultFormat ===
				null || resultFormat.isCorrect
				? 'bg-white'
				: ''} {!resultFormat && 'hover:bg-slate-50 active:bg-slate-100'} 
			{resultFormat &&
				resultFormat.isCorrect === false &&
				selectedInput === index &&
				'bg-red-200'} {resultFormat &&
				resultFormat.isCorrect === false &&
				index === resultFormat.correctAnswer.correctAnswerIndex &&
				'bg-green-200'}"
		>
			<div class="grid__container">
				<span>{index + 1}.</span>
				<span> {answer}</span>
			</div>
			<input
				type="radio"
				class="radio radio-primary radio_button"
				disabled={!!resultFormat}
				name={$testObject.questions[questionIndex].title + '-radio'}
				value={index}
				bind:group={selectedInput}
			/>
		</button>
	{/each}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 25px 1fr;
	}
</style>
