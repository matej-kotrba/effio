<script lang="ts">
	export let icon: string;
	export let onClick = () => {};

	let classes = '';
	export { classes as class };
	export let buttonClasses = '';
</script>

<button
	type="button"
	on:click={onClick}
	class="grid p-2 bg-transparent rounded-full hover:bg-light_text_black_20 dark:hover:bg-dark_text_white_20 place-content-center"
>
	<iconify-icon {icon} class="text-3xl" />
</button>
