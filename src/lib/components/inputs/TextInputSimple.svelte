<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { createEventDispatcher } from 'svelte';
	import type { ZodSchema } from 'zod';

	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
	export let customContainerStyles: string = '';
	export let inputProperties: HTMLInputAttributes = {};
	export let validationSchema: ZodSchema<any> | null = null;

	export let inputValue: HTMLInputAttributes['value'] = '';
	let inputRef: HTMLInputElement;

	const dispatch = createEventDispatcher();

	function validateInput() {
		const result = validationSchema?.safeParse(inputValue);
		if (!result?.success) {
			dispatch('error', result?.error.errors[0].message);
		} else {
			dispatch('error', null);
		}
	}

	function dispatchInputChange() {
		dispatch('inputChange', inputRef.value);
	}
</script>

<div class="group underline_effect w-full before:content-[''] relative {customContainerStyles}">
	<label
		for={titleName}
		class="duration-150 text-light_text_black_80 text-body2 group-focus-within:text-light_primary"
		>{title}</label
	>
	<input
		bind:value={inputValue}
		bind:this={inputRef}
		on:input={dispatchInputChange}
		on:focusout={validateInput}
		name={titleName}
		id={titleName}
		type="text"
		autocomplete="off"
		class="resize-none outline-none bg-white
     overflow-hidden overflow-ellipsis text-light_text_black
     px-2 py-4 rounded-md shadow-lg w-full
     outline-1 outline-transparent outline group-focus-within:outline-primary duration-150
     {customStyles}"
		{...inputProperties}
	/>
</div>

<style>
	.label_decoration {
		transition: left 0.2s, top 0.2s, font-size 0.2s, color 0.2s;
	}
</style>
