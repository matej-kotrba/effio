<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<PickOneQuestion> | null =
		null;
</script>

<div class="flex flex-col gap-2">
	<TextInputSimple
		title="Your answer"
		inputProperties={{ disabled: !!resultFormat }}
		titleName="{$testObject.questions[questionIndex]['title']}{questionIndex}"
		bind:inputValue={$testObject.questions[questionIndex]['content'][
			'answers'
		][0]['answer']}
	/>
	{#if resultFormat && resultFormat['isCorrect'] === false}
		<p class="p-2 rounded-md bg-error dark:bg-dark_error">
			{resultFormat.correctAnswer.answers
				.map((item) => item['answer'])
				.join(', ')}
		</p>
	{/if}
</div>
