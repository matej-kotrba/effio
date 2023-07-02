<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { testObject } from '~stores/testObject';
	import PickOne from './takingInputs/PickOne.svelte';
	import TrueFalse from './takingInputs/TrueFalse.svelte';

	export let questionIndex: number;
</script>

<div class="p-3 rounded-md shadow-md bg-light_whiter">
	<p class="text-light_text_black_40 text-body2">
		{$testObject.questions[questionIndex].displayType}
	</p>
	<div class="p-2">
		<h4 class="text-light_text_black text-h4">{$testObject.questions[questionIndex].title}</h4>
		<Space gap={15} />
		{#if $testObject['questions'][questionIndex]['questionType'] === 'pickOne'}
			<PickOne {questionIndex} />
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'true/false'}
			<TrueFalse {questionIndex} />
		{/if}
	</div>
</div>
