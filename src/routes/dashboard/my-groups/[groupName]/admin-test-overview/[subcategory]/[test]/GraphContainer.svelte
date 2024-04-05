<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };
</script>

<div
	class={twMerge(
		'p-4 bg-light_whiter dark:bg-dark_grey border border-light_text_black_20 dark:border-dark_text_white_20 rounded-md',
		classes
	)}
>
	<slot />
</div>
