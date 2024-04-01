<script lang="ts">
	export let link: string;
	let classes = '';
	export { classes as class };
</script>

<a href={link} class={classes}>
	<iconify-icon
		icon="line-md:arrow-small-left"
		class="text-5xl duration-150 rounded-md hover:bg-gray-200 dark:hover:bg-dark_text_white_20"
	/>
</a>
