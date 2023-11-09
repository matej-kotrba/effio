<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	export let icon: string;
	export let onClick = () => {};
	export let tootlip: string = '';
	export let attr: HTMLButtonAttributes = {};

	let classes = '';
	export { classes as class };
	export let buttonClasses = '';
	export let tooltipClasses = '';
	export let containerClasses = '';
</script>

<div class={twMerge('dropdown dropdown-hover rounded-full', containerClasses)}>
	<button
		type="button"
		{...attr}
		on:click={onClick}
		class={twMerge(
			'grid p-2 duration-150 bg-transparent rounded-full hover:bg-light_text_black_20 dark:hover:bg-dark_text_white_20 place-content-center disabled:opacity-50',
			classes
		)}
	>
		<iconify-icon {icon} class={twMerge('text-3xl', buttonClasses)} />
	</button>
	{#if tootlip}
		<p
			class={twMerge(
				'dropdown-content dropdown-left z-[1] menu p-2 shadow-md bg-light_white dark:bg-dark_terciary rounded-sm w-52',
				tooltipClasses
			)}
		>
			{tootlip}
		</p>
	{/if}
</div>
