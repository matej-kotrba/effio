<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<FillQuestion> | null =
		null;

	console.log(questionIndex);
	$: content = $testObject.questions[questionIndex].content as FillQuestion;
</script>

<div class="flex flex-col gap-2">
	{#each content['answers'] as question, index}
		<span>{question.answer.precedent}</span>
		<TextInputSimple
			title="Your answer"
			inputProperties={{ disabled: !!resultFormat }}
			titleName="{$testObject.questions[questionIndex]['title']}{questionIndex}"
			bind:inputValue={question['answer']['options'][index]}
		/>
		{#if resultFormat && resultFormat['isCorrect'] === false}
			<p class="p-2 rounded-md bg-error dark:bg-dark_error">
				{resultFormat.correctAnswer.answers
					.map((item) => item['answer'])
					.join(', ')}
			</p>
		{/if}
		<span>{question.answer.sequent}</span>
	{/each}
</div>
