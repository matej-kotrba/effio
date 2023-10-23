<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export let title: string;
	export let isLoading: boolean = false;
	export let onClick: Function = () => {};
	export let buttonAttributes: HTMLButtonAttributes = {};
	export { classes as class };
	let classes = '';
</script>

<button
	type="button"
	{...buttonAttributes}
	on:click={(event) => onClick(event)}
	class={twMerge(
		`isolate shadow-lg shadow-light_text_black_20 relative border-none
		 flex items-center duration-150 hover:bg-light_primary 
		 dark:hover:bg-dark_primary dark:text-dark_primary hover:text-white hover:dark:text-dark_text_white text-light_primary 
		  gap-2 btn bg-light_primary dark:bg-dark_primary before:content-[''] hover:before:scale-y-0
			 before:origin-top before:duration-150 before:absolute before:inset-1 before:bg-white dark:before:bg-dark_grey
			  before:rounded-md before:z-[-99] ${
					buttonAttributes.disabled === true
						? 'text-slate-500 bg-slate-500'
						: ''
				}}`,
		classes
	)}
>
	{#if isLoading}
		<span class="loading loading-spinner" />
	{/if}{title}<slot /></button
>
