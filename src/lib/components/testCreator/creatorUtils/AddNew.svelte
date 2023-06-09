<script lang="ts">
	import Icon from '@iconify/svelte';

	export let onClick = () => {};
</script>

<button
	type="button"
	on:click={onClick}
	class="px-8 text-white border-none shadow-lg btn bg-success hover:scale-105 hover:bg-white hover:text-success"
	>Add</button
>
<!-- <button
	type="button"
	on:click={onClick}
	class="grid p-2 duration-150 rounded-full shadow-md group shadow-primary place-content-center w-fit bg-light_whiter hover:bg-light_secondary"
>
	<Icon
		icon="ic:round-plus"
		class="text-5xl duration-150 rounded-lg text-light_secondary group-hover:text-light_whiter"
	/>
</button> -->
