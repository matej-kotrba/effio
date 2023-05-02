<script lang="ts">
	import Icon from '@iconify/svelte';

	export let title: string | undefined = 'Log In';
	export let customStyles: string | undefined = undefined;
</script>

<button
	class="inline-block px-8 py-4 bg-transparent border-4 border-solid rounded-md h-fit text-light_white border-light_primary"
	>{title}</button
>

<!-- px-24 py-6 -->
<!-- <button
	class="border-4 border-light_primary border-solid text-light_white rounded-full text-h4 w-64 shadow-lg
	hover:bg-light_primary duration-200 {customStyles} group"
>
	<div class="grid items-center gap-1 p-1">
		{title ?? 'Log In'}
		<div
			class="grid w-20 duration-200 rounded-full bg-light_primary aspect-square place-items-center group-hover:bg-light_secondary"
		>
			<Icon icon="mdi:account-unlocked" class="text-5xl text-light_white" />
		</div>
	</div>
</button>

<style>
	.grid {
		grid-template-columns: 1fr auto;
	}
</style> -->
