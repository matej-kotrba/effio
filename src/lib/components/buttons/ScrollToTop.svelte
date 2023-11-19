<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';

	export let appearHeight = 400;

	let classes = '';
	export { classes as class };

	let isShown = false;

	function setVisibility() {
		isShown = shouldAppear();
	}

	function shouldAppear() {
		return window.scrollY > appearHeight;
	}

	onMount(() => {
		window.addEventListener('scroll', setVisibility);
		return () => {
			window.removeEventListener('scroll', setVisibility);
		};
	});
</script>

{#if isShown}
	<button
		transition:fly={{ y: 100, duration: 150 }}
		type="button"
		class={twMerge(
			'group fixed bottom-4 right-4 hover:bg-light_grey duration-150 bg-light_whiter p-4 rounded-md shadow-md grid place-content-center',
			classes
		)}
	>
		<iconify-icon
			icon="solar:map-arrow-up-bold"
			class="text-3xl duration-200"
		/>
	</button>
{/if}

<style>
	button:hover > * {
	}
</style>
