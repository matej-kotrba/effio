<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let icon: string;
	export let onClick = () => {};

	let classes = '';
	export { classes as class };
	export let buttonClasses = '';
</script>

<button
	type="button"
	on:click={onClick}
	class={twMerge(
		'grid p-2 duration-150 bg-transparent rounded-full hover:bg-light_text_black_20 dark:hover:bg-dark_text_white_20 place-content-center',
		classes
	)}
>
	<iconify-icon {icon} class={twMerge('text-3xl', buttonClasses)} />
</button>
