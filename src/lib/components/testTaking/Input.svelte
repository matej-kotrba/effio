<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { testObject } from '~stores/testObject';

	export let index: number;
</script>

<div class="p-2 rounded-md shadow-md bg-light_whiter">
	<p class="text-light_text_black_40 text-body2">{$testObject.questions[index].displayType}</p>
	<div class="p-2">
		<h4 class="text-light_text_black text-h4">{$testObject.questions[index].title}</h4>
		<Space gap={15} />
		<div class="flex flex-col gap-2">
			{#each $testObject.questions[index]['content']['answers'] as { answer }, index}
				<div class="px-6 py-3 bg-white rounded-md grid__container">
					<span>{index + 1}.</span>
					<span> {answer}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 25px 1fr;
	}
</style>
