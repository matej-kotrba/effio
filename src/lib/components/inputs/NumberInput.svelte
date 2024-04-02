<script lang="ts">
	import type { ButtonProps } from 'bits-ui';
	import { createEventDispatcher, onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { getNumberInputSchema } from '~schemas/testValidation';

	type $$Props = ButtonProps & {
		inputTitle: string;
		allowDecimal?: boolean;
		isPositive?: boolean;
	};

	let className: $$Props['class'] = '';
	export { className as class };
	export let allowDecimal: $$Props['allowDecimal'] = false;
	export let isPositive: boolean = true;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;

	const dispatch = createEventDispatcher();

	let inputRef: HTMLInputElement;

	const { numberSchema, regexSchema } = getNumberInputSchema({
		isDecimal: allowDecimal,
		positive: isPositive,
		min: min,
		max: max
	});

	function checkInputValidatity() {
		if (inputRef === undefined) return;
		const regexResult = regexSchema.safeParse(inputRef.value);
		if (!regexResult?.success) {
			dispatch('error', regexResult?.error.errors[0].message);
			return;
		}
		const numberResult = numberSchema.safeParse(inputRef.valueAsNumber);
		if (!numberResult?.success) {
			dispatch('error', numberResult?.error.errors[0].message);
			return;
		}

		dispatch('error', null);
	}

	function dispatchInputChange(
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) {
		dispatch('inputChange', inputRef.value);
	}
</script>

<div class="group">
	<input
		on:input={dispatchInputChange}
		on:focusout={() => {
			checkInputValidatity();
			dispatch('focusout');
		}}
		bind:this={inputRef}
		type="number"
		{...$$restProps}
		class={twMerge(
			'w-32 h-10 p-2 outline-transparent outline-1 outline rounded-md group-focus-within:outline-light_primary',
			className
		)}
	/>
	<button type="button" class="w-12">+</button>
	<button type="button" class="w-12">-</button>
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

	input {
		transition: 150ms outline;
	}
</style>
