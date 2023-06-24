<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { createEventDispatcher } from 'svelte';
	import Limit from '~components/informatic/Limit.svelte';
	import { getContext } from 'svelte';
	import type { ZodSchema } from 'zod';

	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
	export let customContainerStyles: string = '';
	export let inputProperties: HTMLTextareaAttributes = {};
	export let validationSchema: ZodSchema<any> | null = null;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;

	export let inputValue: HTMLTextAreaElement['value'] = '';

	let setError = getContext('setError');

	let inputRef: HTMLTextAreaElement;

	const dispatch = createEventDispatcher();

	function validateInput() {
		const result = validationSchema?.safeParse(inputValue);
		if (!result?.success) {
			dispatch('error', result?.error.errors[0].message);
			if (typeof setError === 'function') setError(result?.error.errors[0].message);
		} else {
			dispatch('error', null);
			if (typeof setError === 'function') setError('');
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
	<div class="relative">
		{#if min && max}
			<Limit current={inputValue.length} {min} {max} class="absolute bottom-full right-1" />
		{/if}
		<textarea
			bind:value={inputValue}
			bind:this={inputRef}
			on:input={dispatchInputChange}
			on:focusout={validateInput}
			name={titleName}
			id={titleName}
			autocomplete="off"
			class="resize-none min-h-[150px] outline-none bg-white
		overflow-hidden overflow-ellipsis text-light_text_black
		px-2 py-4 rounded-md shadow-lg w-full
     outline-1 outline-transparent outline group-focus-within:outline-primary duration-150
     {customStyles}"
			{...inputProperties}
		/>
	</div>
</div>

<style>
	.label_decoration {
		transition: left 0.2s, top 0.2s, font-size 0.2s, color 0.2s;
	}
</style>
