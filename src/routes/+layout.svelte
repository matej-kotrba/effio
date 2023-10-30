<script lang="ts">
	import '../app.css';
	import { toast, Toaster } from 'svelte-french-toast';
	import { setContext } from 'svelte';
	import { browser } from '$app/environment';
	import { applicationStates } from '~stores/applicationStates';

	setContext('toast', toast);

	let htmlTag: HTMLElement | undefined | null = undefined;

	if (browser) {
		if (localStorage.getItem('dark') === null) {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				localStorage.setItem('dark', 'true');
			} else {
				localStorage.setItem('dark', 'false');
			}
		}

		const isDarkMode = localStorage.getItem('dark') === 'true';
		$applicationStates.darkMode.isDarkMode = isDarkMode;
		htmlTag = document?.getElementsByTagName('html')[0];
	}

	$: if (htmlTag !== undefined && htmlTag !== null) {
		if ($applicationStates.darkMode.isDarkMode) {
			htmlTag.classList.add('dark');
		} else {
			htmlTag.classList.remove('dark');
		}
	}
</script>

<div>
	<Toaster containerStyle={'z-index: 100;'} />
	<slot />
</div>
