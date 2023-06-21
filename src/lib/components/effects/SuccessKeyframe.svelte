<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { draw, fade } from 'svelte/transition';

	export let successMessage: string = 'Success!';
	export let visible = true;
	export { classes as class };
	let classes = '';
</script>

{#if visible}
	<div class={twMerge('flex flex-col items-center justify-center', classes)} in:fade>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="256"
			height="256"
			viewBox="0 0 256 256"
			class="scale-90"
			><path
				in:draw={{ duration: 1000 }}
				fill="currentColor"
				style="opacity:1;fill:none;stroke:rgb(92 184 92);stroke-width:4.84156466;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
				d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0ZM232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104Zm-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88Z"
			/></svg
		>
		<p class="text-success text-h5">{successMessage}</p>
	</div>
{/if}
