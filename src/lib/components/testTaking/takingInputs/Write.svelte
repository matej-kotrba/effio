<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import type { TestObject } from '~stores/testObject';
	import Comment from '../Comment.svelte';

	export let testObject: TestObject;
	export let questionIndex: number;

	$: content = testObject.questions[questionIndex].content as WriteQuestion;

	export let resultFormat: QuestionServerCheckResponse<WriteQuestion> | null =
		null;
</script>

<div class="flex flex-col gap-2">
	<TextInputSimple
		title="Your answer"
		inputProperties={{ disabled: !!resultFormat }}
		titleName="{testObject.questions[questionIndex]['title']}{questionIndex}"
		bind:inputValue={content['answers'][0]['answer']}
	/>
	{#if resultFormat && resultFormat['correctAnswer']['answers'][0].response}
		<Comment response={resultFormat['correctAnswer']['answers'][0].response} />
	{/if}
	{#if resultFormat && resultFormat['isCorrect'] === false}
		<p class="p-2 rounded-md">
			Correct answer(s): <span class="font-semibold"
				>{resultFormat.correctAnswer.answers
					.map((item) => item['answer'])
					.join(', ')}</span
			>
		</p>
	{/if}
</div>
