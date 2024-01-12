<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	export let isChecked: boolean = false;

	const dispatch = createEventDispatcher();

	function sendToggleEvent() {
		dispatch('toggle', isChecked);
	}

	let classes = '';
	export { classes as class };
</script>

<div class="flex flex-wrap items-center gap-2 {classes}">
	<span
		class="font-semibold uppercase text-light_text_black dark:text-dark_text_white"
		>{title}</span
	>
	<button
		on:click={() => {
			isChecked = !isChecked;
			sendToggleEvent();
		}}
		class:active={isChecked}
		class={`toggle-input`}
	>
		<div class="relative">
			<span
				class="rounded-full bg-light_text_black dark:bg-dark_text_white_40"
			/>
		</div>
	</button>
</div>

<style>
	.toggle-input {
		--container-width: 80px;
		--container-height: 25px;

		width: calc(var(--container-width) + 6px);
		height: calc(var(--container-height) + 6px);
		border-radius: 100px;
		border: 1px solid var(--light-text-black);
		padding: 2px;

		transition: 200ms ease-in-out;

		@apply bg-slate-100;
	}

	:global(.dark) .toggle-input {
		@apply bg-dark_terciary;
		border: 1px solid var(--dark-text-white-40);
	}

	.toggle-input span {
		width: var(--container-height);
		aspect-ratio: 1/1;
		position: absolute;
		left: 0;
		top: 50%;
		translate: 0 -50%;
		transition: 200ms ease-in-out;
	}

	.toggle-input.active {
		border: 1px solid var(--light-primary);
	}

	.toggle-input.active span {
		left: calc(100% - var(--container-height));
		background-color: var(--light-primary);
		animation: scaling 200ms ease-in-out;
	}

	:global(.dark) .toggle-input.active {
		border: 1px solid var(--dark-primary);
	}

	:global(.dark) .toggle-input.active span {
		background-color: var(--dark-primary);
	}
</style>
