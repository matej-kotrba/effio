<script lang="ts">
	export let didTakeTest: boolean;
</script>

{#if didTakeTest}
	<iconify-icon icon="ic:round-check" class="text-2xl text-success" />
{:else}
	<iconify-icon
		icon="ic:round-close"
		class="text-2xl text-error dark:text-dark_error"
	/>
{/if}
