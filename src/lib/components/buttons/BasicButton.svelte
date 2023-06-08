<script lang="ts">
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
	class="flex items-center gap-2 shadow-md btn bg-light_primary hover:bg-white hover:text-light_primary {classes}"
	>{title}<slot /></button
>
