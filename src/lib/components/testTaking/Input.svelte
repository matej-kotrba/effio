<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { testObject } from '~stores/testObject';
	import PickOne from './takingInputs/PickOne.svelte';
	import TrueFalse from './takingInputs/TrueFalse.svelte';
	import { setContext } from 'svelte';

	type ResultFormat =
		| false
		| {
				isCorrect: boolean;
		  };

	export let questionIndex: number;
	export let resultFormat: ResultFormat = false;

	$: console.log(resultFormat);

	export { classes as class };
	let classes = '';
</script>

<div
	class={`p-3 rounded-md shadow-md bg-light_whiter border-2 border-solid ${
		resultFormat !== false
			? resultFormat.isCorrect
				? 'border-success'
				: 'border-red-600'
			: ''
	} ${classes}`}
>
	<p class="text-light_text_black_40 text-body2">
		{$testObject.questions[questionIndex].displayType}
	</p>
	<div class="p-2">
		<h4 class="text-light_text_black text-h4">
			{$testObject.questions[questionIndex].title}
		</h4>
		<Space gap={15} />
		{#if $testObject['questions'][questionIndex]['questionType'] === 'pickOne'}
			<PickOne {questionIndex} resultFormat={!!resultFormat} />
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'true/false'}
			<TrueFalse {questionIndex} resultFormat={!!resultFormat} />
		{/if}
	</div>
</div>
