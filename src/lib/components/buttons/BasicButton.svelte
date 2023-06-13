<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export let title: string;
	export let onClick: Function;
	export let buttonAttributes: HTMLButtonAttributes = {};
	export { classes as class };
	let classes = '';
</script>

<button
	type="button"
	{...buttonAttributes}
	on:click={(event) => onClick(event)}
	class={twMerge(
		'flex items-center gap-2 shadow-md btn bg-light_primary text-white hover:bg-white hover:text-light_primary',
		classes
	)}>{title}<slot /></button
>
