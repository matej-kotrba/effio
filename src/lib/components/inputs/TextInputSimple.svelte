<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { createEventDispatcher } from 'svelte';
	import Limit from '~components/informatic/Limit.svelte';
	import { getContext } from 'svelte';
	import type { ZodSchema } from 'zod';
	import { twMerge } from 'tailwind-merge';

	export let title: string;
	export let titleName: string;
	export let customContainerStyles: string = '';
	export let inputProperties: HTMLInputAttributes = {};
	export let validationSchema: ZodSchema<any> | null = null;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let doesLimit: boolean = false;
	export let trailing: string = '';
	export let displayOutside: boolean = false;

	let classes = '';
	export { classes as class };

	export let inputValue: HTMLInputAttributes['value'] = '';

	let setError = getContext('setError');

	let inputRef: HTMLInputElement;

	const dispatch = createEventDispatcher();

	let isFocused = false;

	function validateInput() {
		if (inputRef === undefined) return;
		let result;
		if (inputRef?.type === 'number') {
			result = validationSchema?.safeParse(inputRef.valueAsNumber);
		} else {
			result = validationSchema?.safeParse(inputValue);
		}
		if (!result?.success) {
			dispatch('error', result?.error.errors[0].message);
			if (typeof setError === 'function')
				setError(result?.error.errors[0].message);
		} else {
			dispatch('error', null);
			if (typeof setError === 'function') setError('');
		}
	}

	function dispatchInputChange(
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) {
		dispatch('inputChange', inputRef.value);
	}

	function keyDownFiltering(e: KeyboardEvent) {
		// if (inputRef.type === 'number') {
		// 	if (e.key === 'Backspace' || e.key === 'Tab') return;
		// 	if (isNaN(Number(e.key))) e.preventDefault();
		// 	if (max && Number(inputRef.value + e.key) > max) e.preventDefault();
		// 	if (inputRef.value.length >= 1 && inputRef.value[0] == '0') {
		// 		inputRef.value = inputRef.value.slice(1);
		// 	}
		// }
	}

	// $: if (
	// 	inputRef &&
	// 	inputRef.type === 'number' &&
	// 	max &&
	// 	+inputRef.value > max
	// ) {
	// 	inputRef.value = max < 0 ? '' : '' + max;
	// }
</script>

{#if displayOutside === true}
	<div class="flex items-center justify-between px-1">
		<label
			for={titleName}
			class={`text-xs duration-150  text-body2 ${
				isFocused
					? 'text-light_primary dark:text-dark_primary'
					: 'text-light_text_black dark:text-dark_text_white'
			}`}>{title}</label
		>
		{#if min !== undefined && max !== undefined && displayOutside === true}
			<Limit current={inputValue.length} {min} {max} class="text-xs" />
		{/if}
	</div>
{/if}
<div
	class="py-1 group underline_effect w-full before:content-[''] relative {customContainerStyles}"
>
	{#if displayOutside === false}
		<label
			for={titleName}
			class="absolute z-10 text-xs duration-150 top-2 left-2 text-light_text_black dark:text-dark_text_white text-body2 group-focus-within:text-light_primary dark:group-focus-within:text-dark_primary"
			>{title}</label
		>
	{/if}
	<div class="relative">
		{#if min !== undefined && max !== undefined && displayOutside === false}
			<Limit
				current={inputValue.length}
				{min}
				{max}
				class="absolute text-xs top-1 right-1"
			/>
		{/if}
		<div class="flex items-center gap-1">
			<input
				bind:value={inputValue}
				bind:this={inputRef}
				on:keydown={keyDownFiltering}
				on:input={dispatchInputChange}
				on:focusout={() => {
					isFocused = false;
					validateInput();
				}}
				on:focus={() => (isFocused = true)}
				name={titleName}
				id={titleName}
				type="text"
				autocomplete="off"
				maxlength={doesLimit ? max : undefined}
				class={twMerge(
					`input_edit resize-none ${
						displayOutside === false ? 'my-1' : 'mb-1'
					} outline-none bg-white dark:bg-dark_light_grey
			overflow-hidden overflow-ellipsis text-light_text_black dark:text-dark_text_white
			px-2 py-4 rounded-md shadow-lg w-full
			outline-1 outline-transparent outline group-focus-within:outline-primary dark:group-focus-within:outline-dark_primary duration-150 
				
			`,
					classes
				)}
				{...inputProperties}
			/>
			{trailing}
		</div>
	</div>
</div>

<style>
	.label_decoration {
		transition: left 0.2s, top 0.2s, font-size 0.2s, color 0.2s;
	}

	.input_edit:disabled {
		@apply bg-gray-300 text-light_text_black_40;
	}

	:global(.dark) .input_edit:disabled {
		@apply bg-stone-900 text-dark_text_white_40;
	}
</style>
