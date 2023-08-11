<script>
	import '../app.css';
	import { toast, Toaster } from 'svelte-french-toast';
	import { setContext } from 'svelte';
	import { applicationStates } from '~stores/applicationStates';

	setContext('toast', toast);
</script>

<!-- <div class:dark={$applicationStates.isDarkMode} class="dark"> -->
<div class="dark">
	<Toaster />
	<slot />
</div>
