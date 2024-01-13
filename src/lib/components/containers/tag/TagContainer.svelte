<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	export let color: string;
	export let isActive: boolean;
	export let isDisabled: boolean = false;

	const dispatch = createEventDispatcher();

	function onButtonClick() {
		dispatch('activeToggle', !isActive);
	}

	function buttonClickCheck() {
		if (isDisabled === false) {
			onButtonClick();
		}
	}
</script>

<button
	type="button"
	disabled={isDisabled}
	on:click={buttonClickCheck}
	style="--bg: {color};"
	class="relative px-6 py-2 duration-150 text-sm {isActive
		? 'bg-light_terciary dark:bg-dark_secondary text-white'
		: 'bg-white text-light_text_black dark:text-dark_text_white dark:bg-dark_light_grey'} rounded-md shadow-md"
>
	{title}
</button>

<style>
	button::before {
		content: '';
		height: 100%;
		width: 4px;
		position: absolute;
		right: 0;
		top: 0;
		border-radius: 0 6px 6px 0;
		background-color: var(--bg);
	}
</style>
