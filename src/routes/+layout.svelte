<script lang="ts">
	import '@total-typescript/ts-reset';
	import '../app.css';
	import { toast, Toaster } from 'svelte-french-toast';
	import { setContext } from 'svelte';
	import { browser } from '$app/environment';
	import { applicationStates } from '~stores/applicationStates';
	// import ScrollToTop from '~components/buttons/ScrollToTop.svelte';

	export let data;

	$: if (data.hasLoggedOut) {
		toast.success('You were successfully logged out!');
	}

	$: if (data.message.text) {
		if (data.message.type === 'success') toast.success(data.message.text);
		else if (data.message.type === 'error') toast.error(data.message.text);
		else toast.error(data.message.text);
	}

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
	<!-- <ScrollToTop /> -->
	<Toaster containerStyle={'z-index: 1000; text-align: center;'} />
	<slot />
</div>
