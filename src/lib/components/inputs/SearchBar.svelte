<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';

	let inputRef: HTMLInputElement;

	export let inputValue: string = '';

	function eraseInputText() {
		inputRef.value = '';
		inputRef.focus();
	}

	$: inputValue = inputRef.value;
</script>

<div
	class="flex w-full overflow-hidden rounded-md bg-light_whiter max-w-[700px] mx-auto shadow-md"
>
	<button
		type="button"
		class="relative flex items-center gap-2 px-2 py-1 rounded-md group"
	>
		<iconify-icon icon="ic:round-search" class="text-3xl" />
		<Separator h="80%" w="1px" color="var(--light-text-black-20)" />
	</button>
	<input
		bind:this={inputRef}
		type="text"
		class="w-full p-3 font-normal bg-transparent outline-none"
		placeholder="Search..."
	/>
	<button
		type="button"
		on:click={eraseInputText}
		class="relative flex items-center gap-1 px-2 py-1 duration-150 rounded-md hover:text-error"
	>
		<iconify-icon icon="ic:round-close" class="text-3xl" />
	</button>
</div>
