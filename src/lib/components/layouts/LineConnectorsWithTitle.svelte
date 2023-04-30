<script lang="ts">
	export let height: number = 400;
	export let lineColor: string = 'royalblue';
</script>

<div class="flex gap-2 px-12" style="min-height: {height}px; --line-color: {lineColor};">
	<div class="grid__line">
		<div class="w-1 rounded-b-full" style="background-color: {lineColor};" />
		<div
			class="relative p-2 rounded-full before:content-[''] before:absolute before:w-[120%] before:aspect-square before:bg-[var(--light_primary)]"
		>
			<slot />
		</div>
		<div class="w-1 bg-red-900 rounded-t-full" />
	</div>
</div>

<style>
	.grid__line {
		display: grid;
		grid-template-rows: 1fr auto 1fr;
		justify-items: center;
	}
</style>
