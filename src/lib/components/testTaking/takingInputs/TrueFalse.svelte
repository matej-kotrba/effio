<script lang="ts">
	import type { TestObject } from '~stores/testObject';
	import Comment from '../Comment.svelte';

	export let questionIndex: number;
	export let testObject: TestObject;

	$: content = testObject.questions[questionIndex].content as TrueFalseQuestion;

	export let resultFormat: QuestionServerCheckResponse<TrueFalseQuestion> | null =
		null;

	const checkBoxValues = (
		testObject.questions[questionIndex]['content'] as TrueFalseQuestion
	)['answers'];

	$: content['answers'] = checkBoxValues;
</script>

<div class="flex flex-col gap-2">
	{#each content['answers'] as { answer, id }, index}
		<button
			type="button"
			disabled={!!resultFormat}
			on:click={() =>
				(checkBoxValues[index]['isTrue'] = !checkBoxValues[index]['isTrue'])}
			class="flex justify-between px-6 py-3 duration-100 {resultFormat ===
				null || resultFormat.isCorrect
				? 'bg-white dark:bg-dark_light_grey'
				: ''} rounded-md shadow-md {!resultFormat &&
				'hover:bg-slate-50 dark:hover:bg-dark_terciary dark:active:bg-dark_quaternary active:bg-slate-100'} 
			"
		>
			<!-- {resultFormat &&
				(resultFormat.isCorrect === false ||
					resultFormat.isCorrect === 'partial') &&
				resultFormat.correctAnswer.answers[index].isTrue ===
					resultFormat.userAnswer.answers[index].isTrue &&
				'bg-correct dark:bg-dark_correct'} {resultFormat &&
				(resultFormat.isCorrect === false ||
					resultFormat.isCorrect === 'partial') &&
				resultFormat.correctAnswer.answers[index].isTrue !==
					resultFormat.userAnswer.answers[index].isTrue &&
				'bg-incorrect dark:bg-dark_incorrect'} -->
			<div class="grid__container">
				<span>{index + 1}.</span>
				<span> {answer}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if resultFormat?.isCorrect === false || resultFormat?.isCorrect === 'partial'}
					{#if resultFormat.correctAnswer.answers.find((item) => item.id === id)?.isTrue}
						<div class="lg:tooltip" data-tip="Correct answer is true">
							<iconify-icon
								icon="charm:tick"
								class="grid text-2xl place-content-center text-correct dark:text-dark_correct"
							/>
						</div>
					{:else}
						<div class="lg:tooltip" data-tip="Correct answer is false">
							<iconify-icon
								icon="ic:round-close"
								class="grid text-2xl place-content-center text-incorrect dark:text-dark_incorrect"
							/>
						</div>
					{/if}
				{/if}
				<input
					type="checkbox"
					class="checkbox checkbox-primary radio_button dark:checkbox-accent"
					disabled={!!resultFormat}
					name={testObject.questions[questionIndex].title + '-radio'}
					bind:checked={checkBoxValues[index]['isTrue']}
				/>
			</div>
		</button>
		{#if resultFormat && resultFormat.correctAnswer.answers[index].response}
			<Comment response={resultFormat.correctAnswer.answers[index].response} />
		{/if}
	{/each}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 25px 1fr;
	}
</style>
