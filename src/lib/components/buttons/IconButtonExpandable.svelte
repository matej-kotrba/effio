<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let width: `${number}px` | `${number}rem` | `${number}%` = '3rem';
	export let shouldExpand = true;
	export let fullText: string;

	let classes = '';
	export { classes as class };
</script>

<button type="button" class="relative isolate group z-[1000]">
	<div
		style={`width: ${width}; height: ${width};`}
		class={twMerge(
			'flex items-center duration-150 shadow-md rounded-xl bg-light_white hover:bg-light_whiter hover:rounded-lg',
			classes
		)}
	>
		<div style={`min-width: ${width};`} class={`grid  place-content-center`}>
			<slot name="title" />
		</div>
		{#if shouldExpand}
			<div
				class="w-0 group-hover:w-fit overflow-hidden absolute flex items-center h-full px-0 group-hover:px-4 shadow-md whitespace-nowrap bg-light_whiter rounded-r-2xl text-body2 z-[-10] left-[10%] group-hover:left-[90%] duration-100"
			>
				{fullText}
			</div>
		{/if}
	</div>
</button>
