<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let w: `${number}px` | `${number}%` = '8px';
	export let h: `${number}px` | `${number}%` = '8px';
	export let color: string | undefined = undefined;

	export { classes as class };
	let classes = '';
</script>

<div
	class={twMerge(
		'mx-auto bg-light_text_black_20 dark:bg-dark_text_white_20 rounded-full',
		classes
	)}
	style="width: {w}; height: {h}; background-color: {color};"
/>
