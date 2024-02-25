<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let originalData: unknown;
	export let onClick: () => void = () => {};

	let classes = '';
	export { classes as class };
</script>

<button
	class={twMerge('', classes)}
	on:click={onClick}
	type="button"
	title={String(originalData)}>{originalData}</button
>
