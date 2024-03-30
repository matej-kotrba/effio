<script lang="ts">
	import Portal from '~components/containers/Portal.svelte';
	import { fly } from 'svelte/transition';

	export let invalidating = false;
</script>

<Portal>
	{#if invalidating}
		<div
			in:fly={{ y: 40, opacity: 1 }}
			out:fly={{ y: 40, opacity: 0 }}
			class="fixed flex items-center gap-2 px-4 py-2 -translate-x-1/2 border rounded-full bottom-8 left-1/2 bg-light_grey border-light_text_black_20 dark:bg-dark_grey dark:border-dark_text_white_20"
		>
			<span>Updating</span>
			<span class="loading loading-spinner loading-md" />
		</div>
	{/if}
</Portal>
