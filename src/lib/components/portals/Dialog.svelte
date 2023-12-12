<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import Skewed from '~components/loaders/Skewed.svelte';

	export let title: string = '';
	export let titleClasses: string = '';
	export const open = () => modal.showModal();
	export const close = () => {
		modal.animate([{ opacity: 1 }, { opacity: 0 }], {
			duration: 150,
			easing: 'ease-in-out'
		}).onfinish = () => modal.close();
	};
	export let isSuccessOpen = false;
	export let isSubmitting = false;

	let modal: HTMLDialogElement;
</script>

<dialog
	bind:this={modal}
	class={`w-full bg-transparent animate-fade duration-150`}
>
	<form
		method="dialog"
		class="relative mx-auto p-4 max-w-[500px] shadow-md rounded-lg w-full min-w-[200px] bg-light_whiter dark:bg-dark_grey text-light_text_black dark:text-dark_text_white"
		on:submit={() => {
			modal.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 150,
				easing: 'ease-in-out'
			}).onfinish = () => modal.close();
		}}
	>
		<SuccessKeyframe
			successMessage="Success!"
			visible={isSuccessOpen}
			class="absolute top-0 left-0 w-full h-full bg-white"
		/>
		<div
			class="bg-light_text_black_40 absolute inset-0 grid place-content-center duration-150 z-10 {isSubmitting
				? 'opacity-100 pointer-events-auto'
				: 'opacity-0 pointer-events-none'}"
		>
			<Skewed />
		</div>
		<div class="flex items-start justify-between m-0 modal-action">
			<h4 class={twMerge('font-semibold text-h6', titleClasses)}>{title}</h4>
			<button type="button" on:click={() => close()}
				><Icon icon="ic:round-close" class="text-2xl" /></button
			>
		</div>
		<slot />
	</form>
</dialog>
