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
</script>

<div class="dropdown dropdown-hover">
	<button
		type="button"
		{...attr}
		on:click={onClick}
		class={twMerge(
			'grid p-2 duration-150 bg-transparent rounded-full hover:bg-light_text_black_20 dark:hover:bg-dark_text_white_20 place-content-center',
			classes
		)}
	>
		<iconify-icon {icon} class={twMerge('text-3xl', buttonClasses)} />
	</button>
	{#if tootlip}
		<p
			class="dropdown-content z-[1] menu p-2 shadow-md bg-light_white dark:bg-dark_terciary rounded-sm w-52"
		>
			{tootlip}
		</p>
	{/if}
</div>
