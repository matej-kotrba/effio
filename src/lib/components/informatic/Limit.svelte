<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let min: number = 0;
	export let current: number;
	export let max: number;
	export { classes as class };
	let classes = '';
</script>

<p class={twMerge('text-body2', classes)}>
	<span
		class={`${
			current > max || current < min
				? 'text-error dark:text-dark_error'
				: 'text-light_primary dark:text-dark_primary'
		}`}>{current}</span
	><span class="text-light_text_black dark:text-dark_text_white text-body2"
		>/</span
	><span class="text-light_text_black dark:text-dark_text_white">{max}</span>
</p>
