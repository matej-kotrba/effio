<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import Skewed from '~components/loaders/Skewed.svelte';
	import { clickOutside } from '~use/clickOutside';
	import { Dialog } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import Portal from '~components/containers/Portal.svelte';

	export let title: string = '';
	export let titleClasses: string = '';

	let classes = '';
	export { classes as class };
	export let formClasses: string = '';

	export const open = () => {
		modal?.showModal();
		isOpen = true;
	};
	export const close = () => {
		if (!modal) return;
		modal.animate([{ opacity: 1 }, { opacity: 0 }], {
			duration: 150,
			easing: 'ease-in-out'
		}).onfinish = () => {
			if (!modal) return;
			modal.close();
		};
		isOpen = false;
	};
	export let isSuccessOpen = false;
	export let isSubmitting = false;

	export let modal: HTMLDialogElement | undefined = undefined;

	let isOpen = false;
</script>

<Portal>
	<div
		class="fixed top-0 left-0 w-screen h-screen duration-200 bg-light_text_black_20 cover z-[1000000] backdrop-blur-sm {isOpen
			? 'opacity-100 pointer-events-auto'
			: 'opacity-0 pointer-events-none'}"
	/>
</Portal>

<dialog
	bind:this={modal}
	class={twMerge(
		`w-full bg-transparent animate-fade duration-150 p-0`,
		classes
	)}
>
	<form
		method="dialog"
		use:clickOutside
		on:clickoutside={() => {
			if (isOpen) {
				close();
			}
		}}
		class={twMerge(
			`overscroll-contains relative mx-auto p-4 max-w-[500px] shadow-md rounded-lg w-full min-w-[200px] bg-light_whiter dark:bg-dark_grey text-light_text_black dark:text-dark_text_white`,
			formClasses
		)}
		on:submit={() => {
			if (!modal) return;
			modal.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 150,
				easing: 'ease-in-out'
			}).onfinish = () => {
				if (!modal) return;
				modal.close();
			};
		}}
	>
		<SuccessKeyframe
			successMessage="Success!"
			visible={isSuccessOpen}
			class="absolute top-0 left-0 z-[11] w-full h-full bg-white dark:bg-dark_grey"
		/>
		<div
			class="bg-light_text_black_40 rounded-lg absolute inset-0 grid place-content-center duration-150 z-10 {isSubmitting
				? 'opacity-100 pointer-events-auto'
				: 'opacity-0 pointer-events-none'}"
		>
			<Skewed />
		</div>
		<div class="flex items-start justify-between m-0 modal-action">
			<h4 class={twMerge('font-semibold text-h6', titleClasses)}>{title}</h4>
			<button type="button" on:click={() => close()}
				><iconify-icon icon="ic:round-close" class="text-2xl" /></button
			>
		</div>
		<slot />
	</form>
</dialog>
