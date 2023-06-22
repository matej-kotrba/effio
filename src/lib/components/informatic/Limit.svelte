<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let min: number = 0;
	export let current: number;
	export let max: number;
	export { classes as class };
	let classes = '';
</script>

<p class={twMerge('text-body2', classes)}>
	<span class={`${current > max || current < min ? 'text-error' : 'text-light_primary'}`}
		>{current}</span
	><span class="text-light_text_black text-body2">/</span><span class="text-light_text_black"
		>{max}</span
	>
</p>
