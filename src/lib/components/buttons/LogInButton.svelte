<script lang="ts">
	import Icon from '@iconify/svelte';

	export let title: string | undefined = undefined;
	export let customStyles: string | undefined = undefined;
</script>

<!-- px-24 py-6 -->
<button
	class=" bg-transparent border-4 border-light_primary border-solid text-light_white rounded-full text-h4 w-64 {customStyles}"
>
	<div class="grid items-center gap-1 p-1">
		{title ?? 'Log In'}
		<div class="grid w-20 rounded-full bg-light_primary aspect-square place-items-center">
			<Icon icon="mdi:account-unlocked" class="text-5xl text-light_white" />
		</div>
	</div>
</button>

<style>
	.grid {
		grid-template-columns: 1fr auto;
	}
</style>
