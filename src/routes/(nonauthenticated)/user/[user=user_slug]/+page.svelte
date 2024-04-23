<script lang="ts">
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import Space from '~components/separators/Space.svelte';

	export let data;
</script>

<div class="grid__container max-w-[800px] mx-auto">
	{#await data.streaming.userData then res}
		{#if res.user}
			<div class="flex flex-col">
				<img
					src={res.user.image}
					alt={res.user.name}
					class="rounded-full w-[18rem] aspect-square"
				/>
				<Space gap={20} />
				<h2 class="font-semibold text-h5">{res.user.name}</h2>
				<span
					class="font-light text-semiBody1 text-light_text_black_60 dark:text-dark_text_white_60"
					>{res.user.slug}</span
				>
				<Space gap={10} />
				<SimpleButton
					variant="ghost"
					class="border border-light_text_black_20 dark:border-dark_text_white_20"
					>Follow</SimpleButton
				>
			</div>
			<div />
		{/if}
	{/await}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: auto 1fr;
	}
</style>
