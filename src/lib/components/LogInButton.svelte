<script lang="ts">
	export let title: string | undefined = undefined;
	export let customStyles: string | undefined = undefined;
</script>

<button class="px-24 py-6 bg-light_primary text-light_white rounded-2xl text-h4">
	{title ?? 'Log In'}
</button>
