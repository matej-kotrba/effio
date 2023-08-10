<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<PickOneQuestion> | null =
		null;

	console.log(resultFormat);
</script>

<div class="flex flex-col gap-2">
	<TextInputSimple
		title="Your answer"
		titleName="{$testObject.questions[questionIndex]['title']}{questionIndex}"
		bind:inputValue={$testObject.questions[questionIndex]['content'][
			'answers'
		][0]['answer']}
	/>
</div>
