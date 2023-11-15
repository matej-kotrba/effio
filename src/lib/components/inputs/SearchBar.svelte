<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';

	let inputRef: HTMLInputElement;

	export let searchFunction: (value: string) => unknown;
	export let initialValue: string = '';
	export let onSubmitSearch: boolean = true;
	export let onInputSearch: boolean = false;

	export let inputValue: string = '';

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!onSubmitSearch) return;
		searchFunction(inputRef.value);
	}

	function eraseInputText(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) {
		e.preventDefault();
		let previousValue = inputRef.value;
		inputRef.value = '';
		inputRef.focus();
		if (previousValue === inputRef.value) return;
		searchFunction(inputRef.value);
	}

	function onChange() {
		if (!onInputSearch) return;
		searchFunction(inputRef.value);
	}

	$: inputValue = inputRef?.value ?? '';

	$: {
		console.log(initialValue);
		if (inputRef?.defaultValue) {
			inputRef.defaultValue = initialValue;
		}
	}
</script>

<form method="POST" on:submit={onSubmit} class="sticky top-2 z-[100]">
	<div
		class="outline-2 focus-within:outline-light_primary dark:focus-within:outline-dark_primary outline-transparent outline flex w-full overflow-hidden rounded-md bg-light_whiter dark:bg-dark_light_grey max-w-[700px] mx-auto shadow-lg duration-100"
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
			on:input={onChange}
			value={initialValue}
			type="text"
			class="w-full p-3 font-normal bg-transparent outline-none"
			placeholder="Search..."
		/>
		<button
			type="button"
			on:click={(e) => eraseInputText(e)}
			class="relative flex items-center gap-1 px-2 py-1 duration-150 rounded-md hover:text-error dark:text-dark_error"
		>
			<iconify-icon icon="ic:round-close" class="text-3xl" />
		</button>
	</div>
</form>
