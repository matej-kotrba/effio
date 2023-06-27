<script>
	import '../app.css';
	import { toast, Toaster } from 'svelte-french-toast';
	import { setContext } from 'svelte';

	setContext('toast', toast);
</script>

<Toaster />
<slot />
