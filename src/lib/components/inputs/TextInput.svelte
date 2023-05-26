<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
	export let customContainerStyles: string = '';
	export let inputProperties: HTMLInputAttributes = {};

	export let inputValue: HTMLInputElement['value'] = '';
	let inputRef: HTMLInputElement;
</script>

<div
	class="underline_effect w-full before:content-[''] relative before:absolute before:w-full
  before:h-0.5 before:bg-light_primary before:top-full before:left-0 before:origin-center before:duration-200
	 before:scale-0 before:focus-within:scale-100 border-b-[0.125rem]
	 border-light_text_black_20 {customContainerStyles}"
>
	<input
		bind:value={inputValue}
		bind:this={inputRef}
		name={titleName}
		id={titleName}
		type="text"
		class="peer outline-none overflow-hidden overflow-ellipsis text-light_text_black px-2 py-4 rounded-t-md shadow-lg w-full {customStyles}"
		{...inputProperties}
	/>
	<label
		for={titleName}
		class="label_decoration absolute text-body1 -translate-y-1/2 left-2 text-light_text_black_60 top-1/2 pointer-events-none
		{inputValue
			? 'text-body2 text-[var(--light-text-black-80)] left-4 top-[0px] peer-focus-within:text-primary'
			: ''}">{title}</label
	>
</div>

<style>
	.label_decoration {
		transition: left 0.2s, top 0.2s, font-size 0.2s, color 0.2s;
	}
</style>
