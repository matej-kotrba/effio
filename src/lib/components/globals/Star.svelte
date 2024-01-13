<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };
</script>

<!-- Default star icon -->
<iconify-icon
	icon="ic:round-star"
	class={twMerge(
		'text-xl text-yellow-300 duration-100 stroke-2 stroke-light_text_black dark:stroke-dark_text_white_20',
		classes
	)}
/>
