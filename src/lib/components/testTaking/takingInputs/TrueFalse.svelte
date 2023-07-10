<script lang="ts">
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: boolean = false;
</script>

<div class="flex flex-col gap-2">
	{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
		<button
			type="button"
			disabled={resultFormat}
			class="flex justify-between px-6 py-3 duration-100 bg-white rounded-md shadow-md hover:bg-slate-50 active:bg-slate-100"
		>
			<div class="grid__container">
				<span>{index + 1}.</span>
				<span> {answer}</span>
			</div>
			<input
				type="checkbox"
				class="checkbox checkbox-primary radio_button"
				disabled={resultFormat}
				name={$testObject.questions[questionIndex].title + '-radio'}
				value={index}
			/>
		</button>
	{/each}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 25px 1fr;
	}
</style>
