<script lang="ts">
	import Icon from '@iconify/svelte';

	export let height: number = 600;
	export let lineColor: string = 'var(--light-secondary)';
	export let icon: string = 'fluent:people-community-28-regular';
	export let title: string = 'Sample title';

	$: firstLineHeight = 0;
</script>

<div class="flex gap-6 px-12" style="min-height: {height}px; --line-color: {lineColor};">
	<div class="grid__line">
		<div
			class="w-1 rounded-b-full"
			style="background-image: linear-gradient(to bottom, transparent 5%, {lineColor});"
			bind:clientHeight={firstLineHeight}
		/>
		<div class="relative p-2 rounded-full" style="">
			<div
				class="absolute w-[0.1px] aspect-square translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] rounded-full z-[1]"
				style="box-shadow: 0 0 30px 25px {lineColor};"
			/>
			<div class="relative z-10">
				<Icon {icon} class="text-4xl" />
			</div>
		</div>
		<div
			class="w-1 rounded-t-full"
			style="background-image: linear-gradient(to top, transparent 5%, {lineColor});"
		/>
	</div>
	<div style="padding-top: {firstLineHeight}px;">
		<h3 class="text-light_text_black text-h4">{title}</h3>
		<slot />
	</div>
</div>

<style>
	.grid__line {
		display: grid;
		grid-template-rows: 1fr auto 1fr;
		justify-items: center;
	}
</style>
