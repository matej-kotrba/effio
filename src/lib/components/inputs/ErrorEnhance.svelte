<script lang="ts">
	import { setContext } from 'svelte';

	export let error = '';

	function setError(e: string) {
		error = e;
	}

	setContext('setError', setError);
</script>

<div>
	<slot />
	<p class={`text-body2 text-error ${error ? 'opacity-100' : 'opacity-0'}`}>
		{error || 'Placeholder error'}
	</p>
</div>
