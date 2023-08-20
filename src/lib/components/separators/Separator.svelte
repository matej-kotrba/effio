<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let w: `${number}px` | `${number}%` = '8px';
	export let h: `${number}px` | `${number}%` = '8px';
	export let color: string = 'white';

	export { classes as class };
	let classes = '';
</script>

<div
	class={twMerge('mx-auto bg-white rounded-full', classes)}
	style="width: {w}; height: {h}; background-color: {color};"
/>
