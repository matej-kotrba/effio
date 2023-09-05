<script lang="ts">
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<TrueFalseQuestion> | null =
		null;

	const checkBoxValues = (
		$testObject.questions[questionIndex]['content'] as TrueFalseQuestion
	)['answers'];

	$: $testObject.questions[questionIndex]['content']['answers'] =
		checkBoxValues;
</script>

<div class="flex flex-col gap-2">
	{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
		<button
			type="button"
			disabled={!!resultFormat}
			on:click|self={() =>
				(checkBoxValues[index]['isTrue'] = !checkBoxValues[index]['isTrue'])}
			class="flex justify-between px-6 py-3 duration-100 {resultFormat ===
				null || resultFormat.isCorrect
				? 'bg-white dark:bg-dark_light_grey'
				: ''} rounded-md shadow-md {!resultFormat &&
				'hover:bg-slate-50 dark:hover:bg-dark_terciary dark:active:bg-dark_quaternary active:bg-slate-100'} 
			{resultFormat &&
				resultFormat.isCorrect === false &&
				resultFormat.correctAnswer.answers[index].isTrue ===
					resultFormat.userAnswer.answers[index].isTrue &&
				'bg-green-200'} {resultFormat &&
				resultFormat.isCorrect === false &&
				resultFormat.correctAnswer.answers[index].isTrue !==
					resultFormat.userAnswer.answers[index].isTrue &&
				'bg-red-200'}"
		>
			<div class="grid__container">
				<span>{index + 1}.</span>
				<span> {answer}</span>
			</div>
			<input
				type="checkbox"
				class="checkbox checkbox-primary radio_button dark:checkbox-accent"
				disabled={!!resultFormat}
				name={$testObject.questions[questionIndex].title + '-radio'}
				bind:checked={checkBoxValues[index]['isTrue']}
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
