<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let width: `${number}px` | `${number}rem` | `${number}%` = '3rem';
	export let shouldExpand = true;
	export let fullText: string;
	export let onClick: () => void = () => {};

	let classes = '';
	export { classes as class };
	export let containerClasses = '';
</script>

<button
	type="button"
	on:click={onClick}
	class={twMerge(`relative isolate group`, containerClasses)}
>
	<div
		style={`width: ${width}; height: ${width};`}
		class={twMerge(
			'flex items-center duration-150 border border-light_text_black_20 dark:border-dark_text_white_20 rounded-xl bg-light_white dark:bg-dark_light_grey hover:bg-light_whiter dark:hover:bg-dark_terciary hover:rounded-lg',
			classes
		)}
	>
		<div style={`min-width: ${width};`} class={`grid  place-content-center`}>
			<slot name="title" />
		</div>
		{#if shouldExpand}
			<div
				class="w-0 group-hover:w-fit overflow-hidden absolute flex items-center h-full px-0
				 group-hover:px-4 whitespace-nowrap bg-light_whiter dark:bg-dark_light_grey
				 rounded-r-2xl text-body2 z-[-10] left-[10%] group-hover:left-[90%] duration-100
				 border group-hover:border-light_text_black_10 group-hover:dark:border-dark_text_white_10"
			>
				{fullText}
			</div>
		{/if}
	</div>
</button>
