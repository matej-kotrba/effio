<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { testObject } from '~stores/testObject';
	import PickOne from './takingInputs/PickOne.svelte';
	import TrueFalse from './takingInputs/TrueFalse.svelte';
	import Connect from './takingInputs/Connect.svelte';
	import Write from './takingInputs/Write.svelte';
	import Fill from './takingInputs/Fill.svelte';

	type ResultFormat = null | QuestionServerCheckResponse<QuestionContent>;
	export let questionIndex: number;
	export let resultFormat: ResultFormat = null;

	export { classes as class };
	let classes = '';

	$: typedResultFormat = resultFormat as any;
</script>

<div
	class={`p-3 rounded-md shadow-md bg-light_whiter dark:bg-dark_grey outline-2 outline ${
		resultFormat
			? resultFormat.isCorrect
				? 'outline-success'
				: 'outline-error dark:outline-dark_error'
			: 'outline-transparent'
	} ${classes}`}
>
	<p class="text-light_text_black dark:text-dark_text_white_40 text-body2">
		{$testObject.questions[questionIndex].displayType}
	</p>
	<div class="p-2">
		<h4 class="text-light_text_black dark:text-dark_text_white text-h4">
			{$testObject.questions[questionIndex].title}
		</h4>
		<Space gap={15} />
		{#if $testObject['questions'][questionIndex]['questionType'] === 'pickOne'}
			<PickOne
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'pickOne'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'true/false'}
			<TrueFalse
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'true/false'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'connect'}
			<Connect
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'connect'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'write'}
			<Write
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'write'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'fill'}
			<Fill
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'fill'
					? typedResultFormat
					: null}
			/>
		{/if}
	</div>
</div>
