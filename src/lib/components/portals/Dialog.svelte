<script lang="ts">
	import Icon from '@iconify/svelte';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import Skewed from '~components/loaders/Skewed.svelte';

	export const open = () => modal.showModal();
	export let isSuccessOpen = false;
	export let isSubmitting = false;

	let modal: HTMLDialogElement;
</script>

<dialog bind:this={modal} class="modal">
	<form
		method="dialog"
		class="relative modal-box bg-light_whiter text-light_text_black"
	>
		<SuccessKeyframe
			successMessage="Success!"
			visible={isSuccessOpen}
			class="absolute top-0 left-0 w-full h-full bg-white"
		/>
		<div
			class="bg-light_text_black_40 absolute inset-0 grid place-content-center duration-150 {isSubmitting
				? 'opacity-100 pointer-events-auto'
				: 'opacity-0 pointer-events-none'}"
		>
			<Skewed />
		</div>
		<div class="modal-action">
			<button type="button" on:click={() => modal.close()}
				><Icon
					icon="ic:round-close"
					class="absolute text-2xl top-4 right-4"
				/></button
			>
		</div>
		<slot />
	</form>
</dialog>
