<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	export let color: string;
	export let isActive: boolean;

	const dispatch = createEventDispatcher();

	function onButtonClick() {
		dispatch('activeToggle', !isActive);
	}
</script>

<button
	type="button"
	on:click={onButtonClick}
	class="px-6 py-2 duration-150 text-sm {isActive
		? 'bg-light_terciary text-white'
		: 'bg-white text-light_text_black'} rounded-md shadow-md"
>
	{title}
</button>
