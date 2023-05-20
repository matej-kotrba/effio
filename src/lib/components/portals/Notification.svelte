<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let timeToDecay: number = 3000;

	let shouldShow = false;

	let ref: HTMLElement;
	let portal: HTMLDivElement;

	onMount(() => {
		if (!browser) return;
		portal = document.createElement('div');
		portal.className = 'portal';
		document.body.appendChild(portal);
		portal.appendChild(ref);
		shouldShow = true;
		setTimeout(() => {
			shouldShow = false;
		}, timeToDecay);
	});

	onDestroy(() => {
		if (!browser) return;
		document.body.removeChild(portal);
	});
</script>

<div
	bind:this={ref}
	class="fixed px-6 py-3 duration-200 origin-center bg-white rounded-md shadow-lg opacity-0 shadow-light_text_black_20 bottom-4 left-1/2"
	style={shouldShow
		? `opacity: 1; transform: translateY(0px);`
		: 'opacity: 0; transform: translateY(40px);'}
>
	<slot />
</div>
