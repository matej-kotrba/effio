<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };
</script>

<div
	class={twMerge(
		'p-4 bg-light_whiter dark:bg-dark_grey shadow-md rounded-md',
		classes
	)}
>
	<slot />
</div>
