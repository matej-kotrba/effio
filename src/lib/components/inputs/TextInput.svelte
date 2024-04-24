<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { ZodSchema } from 'zod';
	import {
		beforeUpdate,
		createEventDispatcher,
		getContext,
		onMount,
		tick
	} from 'svelte';
	import { twMerge } from 'tailwind-merge';

	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
	export let customContainerStyles: string = '';
	export let inputProperties: HTMLTextareaAttributes = {};
	export let validationSchema: ZodSchema<any> | null = null;
	export let doesAutoScale: boolean = true;

	export let inputValue: HTMLInputElement['value'] = '';
	let inputRef: HTMLTextAreaElement;

	let setError = getContext('setError');

	const dispatch = createEventDispatcher();

	function onAutoScaleInput() {
		inputRef.style.height = 'auto';
		inputRef.style.height = inputRef.scrollHeight + 'px';
		if (inputValue === 'Automatickou instalaci bezpečnostních aktualizací') {
			console.log(inputRef.scrollHeight);
		}
	}

	function validateInput() {
		const result = validationSchema?.safeParse(inputValue);
		if (!result?.success) {
			dispatch('error', result?.error.errors[0].message);
			if (typeof setError === 'function')
				setError(result?.error.errors[0].message);
		} else {
			dispatch('error', null);
			if (typeof setError === 'function') setError('');
		}
	}

	onMount(async () => {
		if (doesAutoScale) {
			setTimeout(() => {
				onAutoScaleInput();
			}, 0);
		}
	});
</script>

<div
	class={twMerge(
		`underline_effect w-full before:content-[''] relative before:absolute before:w-full
  before:h-0.5 before:bg-light_primary dark:before:bg-dark_primary before:top-full before:left-0 before:origin-center before:duration-200
	 before:scale-0 before:focus-within:scale-100 border-b-[0.125rem]
	 border-light_text_black_20`,
		customContainerStyles
	)}
>
	<textarea
		bind:value={inputValue}
		bind:this={inputRef}
		name={titleName}
		id={titleName}
		autocomplete="off"
		rows="1"
		on:focusout={validateInput}
		on:input={() => {
			if (doesAutoScale) {
				onAutoScaleInput();
			}
		}}
		class={twMerge(
			'h-auto resize-none peer outline-none bg-white dark:bg-dark_light_grey overflow-hidden overflow-ellipsis text-light_text_black dark:text-dark_text_white px-2 py-4 shadow-lg w-full',
			customStyles
		)}
		{...inputProperties}
	/>
	<label
		for={titleName}
		class="label_decoration absolute text-body2 sm:text-body1 -translate-y-1/2 left-2 text-light_text_black_60 dark:text-dark_text_white_60 top-1/2 pointer-events-none
		{inputValue
			? 'text-body3 sm:text-body2 text-[var(--light-text-black-80)] left-4 top-[0px] peer-focus-within:text-light_primary dark:peer-focus-within:text-dark_primary'
			: ''}">{title}</label
	>
</div>

<style>
	.label_decoration {
		transition: left 0.2s, top 0.2s, font-size 0.2s, color 0.2s;
	}
</style>
