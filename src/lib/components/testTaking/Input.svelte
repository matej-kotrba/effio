<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { testObject } from '~stores/testObject';

	console.log($testObject.questions[0].title + '-radio');

	export let questionIndex: number;
</script>

<div class="p-2 rounded-md shadow-md bg-light_whiter">
	<p class="text-light_text_black_40 text-body2">
		{$testObject.questions[questionIndex].displayType}
	</p>
	<div class="p-2">
		<h4 class="text-light_text_black text-h4">{$testObject.questions[questionIndex].title}</h4>
		<Space gap={15} />
		<div class="flex flex-col gap-2">
			{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
				<div class="flex justify-between px-6 py-3 bg-white rounded-md">
					<div class=" grid__container">
						<span>{index + 1}.</span>
						<span> {answer}</span>
					</div>
					<input
						type="radio"
						class="radio radio-primary radio_button"
						name={$testObject.questions[questionIndex].title + '-radio'}
					/>
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
