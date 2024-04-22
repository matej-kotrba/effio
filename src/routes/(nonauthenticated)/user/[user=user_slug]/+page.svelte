<script lang="ts">
	export let data;
</script>

<div class="grid__container max-w-[800px] mx-auto">
	{#await data.streaming.userData then res}
		{#if res.user}
			<div class="flex flex-col">
				<img
					src={res.user.image}
					alt={res.user.name}
					class="rounded-full w-80 aspect-square"
				/>
				<h2 class="font-semibold text-h4">{res.user.name}</h2>
				<span
					class="text-body1 text-light_text_black_60 dark:text-dark_text_white_60"
					>{res.user.slug}</span
				>
			</div>
			<div />
		{/if}
	{/await}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 1fr 3fr;
	}
</style>
