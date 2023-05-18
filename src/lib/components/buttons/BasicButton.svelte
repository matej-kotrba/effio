<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export let title: string;
	export let onClick: Function;
	export let buttonAttributes: HTMLButtonAttributes = {};
</script>

<button
	type="button"
	{...buttonAttributes}
	on:click={(event) => onClick(event)}
	class="flex items-center gap-2 text-white shadow-md btn bg-light_primary hover:bg-white hover:text-light_primary"
	>{title}<slot /></button
>
