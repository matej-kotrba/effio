<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import {
		intersection,
		onIntersect
	} from '../../../lib/use/intersectionObserver';

	// export let height: number = 500;
	export let lineColor: string = 'var(--light-secondary)';
	export let icon: string = 'fluent:people-community-28-regular';
	export let title: string = 'Sample title';
	export let iconClasses = '';

	$: firstLineHeight = 0;
</script>

<div
	class="flex gap-6 px-4 duration-500 opacity-0 sm:px-8 md:px-12 box group lg:min-h-[400px] md:min-h-[300px] min-h-[200px]"
	style="--line-color: {lineColor};"
	use:intersection={true}
	on:intersect={(event) => onIntersect(event, ['opacity-100', 'active'])}
>
	<div class="grid__line">
		<div
			class="w-1 rounded-b-full scale-y-0 group-[.active]:scale-y-100 origin-bottom delay-200 duration-500"
			style="background-image: linear-gradient(to bottom, transparent 5%, {lineColor});"
			bind:clientHeight={firstLineHeight}
		/>
		<div
			class="relative p-2 rounded-full duraion-300 opacity-0 group-[.active]:opacity-100"
		>
			<div
				class="absolute w-[0.1px] aspect-square translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] rounded-full z-[1]"
				style="box-shadow: 0 0 30px 25px {lineColor};"
			/>
			<div
				class={twMerge('relative z-10 grid place-content-center', iconClasses)}
			>
				<iconify-icon
					{icon}
					class="text-2xl sm:text-4xl text-light_text_black dark:text-dark_text_white"
				/>
			</div>
		</div>
		<div
			class="w-1 rounded-t-full scale-y-0 group-[.active]:scale-y-100 origin-top delay-200 duration-500"
			style="background-image: linear-gradient(to top, transparent 5%, {lineColor});"
		/>
	</div>
	<div style="padding-top: {firstLineHeight}px;">
		<h3
			class="text-light_text_black dark:text-dark_text_white text-body1 md:text-h6 lg:text-h4"
		>
			{title}
		</h3>
		<slot />
	</div>
</div>

<style>
	.grid__line {
		display: grid;
		grid-template-rows: 1fr auto 3fr;
		justify-items: center;
	}
</style>
