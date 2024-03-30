<script lang="ts">
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		event.preventDefault();
		event.returnValue = '';
	}
</script>

<svelte:window on:beforeunload={handleBeforeUnload} />
