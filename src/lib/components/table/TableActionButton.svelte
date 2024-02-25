<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import Dialog from '~components/portals/Dialog.svelte';

	export let tooltip: string;
	export let dialogTitle: string;
	export let backdropColorEffect: string;
	export let borderColorEffect: string;
	export let onClickCallback = (dialog: HTMLDialogElement) => {};
	export let isSubmittingDialog = false;

	let classes = '';
	export { classes as class };

	let dialogRef: HTMLDialogElement;
	let buttonElement: HTMLButtonElement;

	function onMouseMove(
		e: MouseEvent & {
			currentTarget: EventTarget & Window;
		}
	) {
		buttonElement.style.setProperty('--blur-x', `${e.x}px`);
		buttonElement.style.setProperty('--blur-y', `${e.y}px`);
	}

	function onClick() {
		onClickCallback(dialogRef);
	}
</script>

<svelte:window on:mousemove={onMouseMove} />
<Dialog
	bind:modal={dialogRef}
	title={dialogTitle}
	isSubmitting={isSubmittingDialog}
>
	<slot name="dialog" modal={dialogRef} />
</Dialog>
<button
	type="button"
	bind:this={buttonElement}
	title={tooltip}
	style="--backdropColor: {backdropColorEffect}; --borderColor: {borderColorEffect}; --blur-x: 0px; --blur-y: 0px;"
	class={twMerge(
		'relative grid p-4 rounded-2xl place-content-center bg-light_whiter shadow-md',
		classes
	)}
	on:click={onClick}
>
	<slot />
</button>

<style>
	button::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: inherit;
		background-attachment: fixed;
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--borderColor),
			transparent 3rem
		);
		z-index: -10;
		pointer-events: none;
	}

	button::after {
		content: '';
		position: absolute;
		inset: 0px;
		border-radius: inherit;
		background-attachment: fixed;
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--backdropColor),
			transparent 3rem
		);
		pointer-events: none;
		z-index: 0;
	}
</style>
