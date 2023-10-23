<script lang="ts">
	import Icon from '@iconify/svelte';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import Skewed from '~components/loaders/Skewed.svelte';

	export let title: string = '';
	export const open = () => modal.showModal();
	export const close = () => modal.close();
	export let isSuccessOpen = false;
	export let isSubmitting = false;

	let modal: HTMLDialogElement;
</script>

<dialog bind:this={modal} class="modal">
	<form
		method="dialog"
		class="relative modal-box bg-light_whiter dark:bg-dark_grey text-light_text_black dark:text-dark_text_white"
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
		<div class="flex items-center justify-between m-0 modal-action">
			<h4 class="font-semibold text-h6">{title}</h4>
			<button type="button" on:click={() => modal.close()}
				><Icon icon="ic:round-close" class="text-2xl" /></button
			>
		</div>
		<slot />
	</form>
</dialog>
