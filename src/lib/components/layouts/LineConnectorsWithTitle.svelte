<script lang="ts">
	import Icon from '@iconify/svelte';
	import { intersection, onIntersect } from '../../../lib/use/intersectionObserver';

	export let height: number = 600;
	export let lineColor: string = 'var(--light-secondary)';
	export let icon: string = 'fluent:people-community-28-regular';
	export let title: string = 'Sample title';

	$: firstLineHeight = 0;
</script>

<div
	class="flex gap-6 px-12 duration-500 opacity-0 box group"
	style="min-height: {height}px; --line-color: {lineColor};"
	use:intersection={true}
	on:intersect={(event) => onIntersect(event, ['opacity-100', 'active'])}
>
	<div class="grid__line">
		<div
			class="w-1 rounded-b-full scale-y-0 group-[.active]:scale-y-100 origin-bottom delay-200 duration-500"
			style="background-image: linear-gradient(to bottom, transparent 5%, {lineColor});"
			bind:clientHeight={firstLineHeight}
		/>
		<div class="relative p-2 rounded-full duraion-300 opacity-0 group-[.active]:opacity-100">
			<div
				class="absolute w-[0.1px] aspect-square translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] rounded-full z-[1]"
				style="box-shadow: 0 0 30px 25px {lineColor};"
			/>
			<div class="relative z-10">
				<Icon {icon} class="text-4xl text-light_text_black" />
			</div>
		</div>
		<div
			class="w-1 rounded-t-full scale-y-0 group-[.active]:scale-y-100 origin-top delay-200 duration-500"
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
