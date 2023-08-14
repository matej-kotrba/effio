<script lang="ts">
	import '../app.css';
	import { toast, Toaster } from 'svelte-french-toast';
	import { setContext } from 'svelte';
	import { browser } from '$app/environment';

	setContext('toast', toast);

	let htmlTag: HTMLElement | undefined | null = undefined;

	if (browser) {
		htmlTag = document?.getElementsByTagName('html')[0];
	}

	$: if (htmlTag !== undefined) htmlTag?.classList.add('dark');

	//TODO: Replace mock dark mode with dynamic JS solution
</script>

<!-- <div class:dark={$applicationStates.isDarkMode} class="dark"> -->
<div class="dark">
	<Toaster />
	<slot />
</div>
