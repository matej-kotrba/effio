<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { onMount } from 'svelte';
	import { initializeTestToTestStore } from '~helpers/test.js';
	import { testObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';
	import Input from '~components/testTaking/Input.svelte';

	export let data;

	// console.log({
	// 	...data.record.test,
	// 	questions: data.record.questionRecords.map((item) => item.content)
	// });
	// onMount(() => {
	// 	initializeTestToTestStore({
	// 		...data.record.test,
	// 		questions: data.record.questionRecords.map((item) => item.content)
	// 	});
	// });
</script>

<DashboardTitle
	title="Test History"
	subtitle="Browser through your test records."
/>

<!-- {#if $testObject}
	<div class="mx-auto max-w-[650px]">
		{#each data.record.questions as _, index}
			<Input
				questionIndex={index}
				class={`border-2 border-solid ${
					$testObject.questions[index].errors.content
						? ' border-error'
						: 'border-transparent'
				}`}
				resultFormat={data.record}
			/>
		{/each}
	</div>
{/if} -->
