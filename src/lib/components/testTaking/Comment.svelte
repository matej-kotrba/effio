<script lang="ts">
	export let response: string | undefined;
</script>

{#if response}
	<p
		class="p-2 rounded-sm text-light_text_black dark:text-dark_text_white_60 bg-light_grey dark:bg-dark_light_grey"
	>
		{response}
	</p>
{/if}
