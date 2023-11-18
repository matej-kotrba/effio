<script lang="ts">
	import { parse, type GIFTQuestion } from 'gift-pegjs';
	import { createEventDispatcher } from 'svelte';

	export let additionalText: string = '';

	const dispatch = createEventDispatcher();

	let fileRef: HTMLInputElement | null = null;

	function readFile() {
		if (!fileRef?.files || !fileRef.files[0]) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const fileContent = e.target?.result;
			if (!fileContent) return;

			let parsed: undefined | GIFTQuestion[];
			try {
				parsed = parse(fileContent as string);
			} catch (e) {
				return;
			}

			dispatch('parsedFile', parsed);
		};
		reader.readAsText(fileRef.files[0]);
	}
</script>

<div
	class="relative w-full p-5 duration-300 rounded-xl shadow-surrounding max-w-xxs aspect-square box"
>
	<div>
		<h4
			class="text-center text-h6 text-light_text_black dark:text-dark_text_white"
		>
			Import file<br />
		</h4>
		<span class="block text-xs text-center">({additionalText})</span>
		<div class="grid place-content-center">
			<img
				src={'/imgs/svgs/import.svg'}
				alt=""
				role="presentation"
				class="object-cover w-[100px] sm:w-[150px]"
				width="150"
			/>
		</div>
	</div>
	<input
		bind:this={fileRef}
		accept=".txt"
		on:dragover={() => console.log('asdasd')}
		on:input={readFile}
		type="file"
		class="absolute w-full h-full opacity-0 input-styled"
	/>
</div>

<style>
	.box {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.input-styled {
		color: transparent;
		cursor: pointer;
		background-color: transparent;
	}

	.input-styled::-webkit-file-upload-button {
		display: none;
	}
</style>
