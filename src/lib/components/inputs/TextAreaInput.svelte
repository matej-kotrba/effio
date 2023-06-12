<script lang="ts">
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
	export let customContainerStyles: string = '';
	export let inputProperties: HTMLTextareaAttributes = {};

	export let inputValue: HTMLTextAreaElement['value'] = '';
	let inputRef: HTMLTextAreaElement;
</script>

<div class="underline_effect w-full before:content-[''] relative {customContainerStyles}">
	<textarea
		bind:value={inputValue}
		bind:this={inputRef}
		name={titleName}
		id={titleName}
		autocomplete="off"
		class="resize-none peer outline-none bg-white overflow-hidden overflow-ellipsis text-light_text_black px-2 py-4 rounded-md shadow-lg w-full {customStyles}"
		{...inputProperties}
	/>
	<label
		for={titleName}
		class="label_decoration absolute text-body2 -translate-y-1/2 left-4 top-[0px] text-light_text_black_60 pointer-events-none
		{inputValue ? 'text-[var(--light-text-black-80)] peer-focus-within:text-primary' : ''}"
		>{title}</label
	>
</div>

<style>
	.label_decoration {
		transition: left 0.2s, top 0.2s, font-size 0.2s, color 0.2s;
	}
</style>
