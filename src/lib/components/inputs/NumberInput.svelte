<script lang="ts">
	import type { ButtonProps } from 'bits-ui';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { getNumberInputSchema } from '~schemas/testValidation';

	type $$Props = ButtonProps & {
		inputValue: string;
		inputTitle: string;
		allowDecimal?: boolean;
		isPositive?: boolean;
		canBeNullable?: boolean;
		min?: number;
		max?: number;
	};

	let setError = getContext('setError');

	let className: $$Props['class'] = '';
	export { className as class };
	export let allowDecimal: $$Props['allowDecimal'] = false;
	export let isPositive: boolean = true;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let canBeNullable: $$Props['canBeNullable'] = false;

	export let inputTitle: string;
	export let inputValue: HTMLInputElement['value'] = '';

	const dispatch = createEventDispatcher();

	let inputRef: HTMLInputElement;

	const { numberSchema, regexSchema } = getNumberInputSchema({
		isDecimal: allowDecimal,
		positive: isPositive,
		min: min,
		max: max,
		canBeNullable
	});

	function checkInputValidatity() {
		if (inputRef === undefined) return;
		const regexResult = regexSchema.safeParse(inputRef.value || null);
		if (!regexResult?.success) {
			dispatch('error', regexResult?.error.errors[0].message);
			if (typeof setError === 'function') {
				setError(regexResult?.error.errors[0].message);
			}
			return;
		}
		const numberResult = numberSchema.safeParse(Number(inputRef.value) || null);
		if (!numberResult?.success) {
			dispatch('error', numberResult?.error.errors[0].message);
			if (typeof setError === 'function')
				setError(numberResult?.error.errors[0].message);
			return;
		}

		dispatch('error', null);
		if (typeof setError === 'function') setError('');
	}

	function dispatchInputChange() {
		console.log(inputRef.value);
		dispatch('inputChange', inputRef.value);
	}

	function addValue() {
		if (inputRef === undefined) return;
		if (typeof max === 'number' && Number(inputRef.value) === max) return;
		if (isNaN(Number(inputRef.value))) {
			inputRef.value = '0';
		}
		inputRef.value = `${Number(inputRef.value) + 1}`;
		dispatchInputChange();
	}

	function subtractValue() {
		if (inputRef === undefined) return;
		if (typeof min === 'number' && Number(inputRef.value) === min) return;
		if (isPositive && Number(inputRef.value) === 0) return;
		if (isNaN(Number(inputRef.value))) {
			inputRef.value = min ? `${min + 1}` : '0';
		}
		inputRef.value = `${Number(inputRef.value) - 1}`;
		dispatchInputChange();
	}
</script>

<div class="flex flex-col group">
	<label for={inputTitle} class="text-body2">{inputTitle}</label>
	<div class="relative flex items-center h-10 bg-white dark:bg-dark_grey w-fit">
		<div
			class="relative before:content-[''] before:absolute before:w-full
        before:h-0.5 before:bg-light_primary dark:before:bg-dark_primary before:bottom-0 before:left-0 before:origin-center before:duration-200
        before:scale-0 group-focus-within:before:scale-100"
		>
			<input
				bind:value={inputValue}
				on:input={dispatchInputChange}
				on:focusout={() => {
					checkInputValidatity();
					dispatch('focusout');
				}}
				bind:this={inputRef}
				type="text"
				name={inputTitle}
				{...$$restProps}
				class={twMerge(
					`w-32 bg-transparent outline-none p-2 rounded-md`,
					className
				)}
			/>
		</div>
		<div class="flex h-full">
			<div
				class="w-[1px] h-full bg-light_text_black_20 dark:bg-dark_text_white_20"
			/>
			<button
				type="button"
				class="w-12 h-full duration-100 hover:bg-light_grey dark:hover:bg-dark_light_grey"
				on:click={addValue}>+</button
			>
			<div
				class="w-[1px] h-full bg-light_text_black_20 dark:bg-dark_text_white_20"
			/>
			<button
				type="button"
				class="w-12 h-full duration-100 hover:bg-light_grey dark:hover:bg-dark_light_grey"
				on:click={subtractValue}>-</button
			>
		</div>
	</div>
</div>

<style>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
