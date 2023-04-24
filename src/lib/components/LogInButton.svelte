<script lang="ts">
	export let title: string | undefined = undefined;
	export let customStyles: string | undefined = undefined;
</script>

<button style="p-8 {customStyles}">
	{title ?? 'Log In'}
</button>
