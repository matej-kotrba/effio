<!-- <script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '~components/separators/Separator.svelte';

	export let inputType: QuestionContent['inputType'] | null = null;

	let dialogRef: HTMLDialogElement | null = null;

	export function openDialog() {
		dialogRef?.showModal();
	}

	export function closeModal() {
		dialogRef?.close();
	}
</script>

{#if inputType !== null}
	<dialog bind:this={dialogRef}>
		<button on:click={closeModal}><Icon icon="material-symbols:close-rounded" /></button>
		<form>
			<p class="text-lg text-light_text_black_40">{inputType}</p>
			<input type="text" name="title" />
			<Separator />
			<button>Add</button>
		</form>
	</dialog>
{/if} -->
