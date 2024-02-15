<script lang="ts">
	export let checked: boolean,
		indeterminate: HTMLInputElement['indeterminate'],
		disabled: boolean = false,
		onChange: (e: Event) => void;
</script>

<div class="relative grid w-fit h-fit place-content-center">
	<input
		type="checkbox"
		on:change={onChange}
		{checked}
		bind:indeterminate
		{disabled}
	/>
	<div class="container" />
</div>

<style>
	input {
		appearance: none;
		-webkit-appearance: none;
		width: 25px;
		aspect-ratio: 1/1;
		border: 1px solid var(--light-text-black-40);
		border-radius: 8px;
		cursor: pointer;
	}

	.container {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.container::after {
		content: '';
		position: absolute;
		inset: 3px;
		background-color: var(--light-primary);
		border-radius: 6px;
		opacity: 0;
	}

	input:indeterminate + .container::after {
		opacity: 1;
		background-color: var(--warning);
	}

	input:indeterminate {
		border: 1px solid var(--warning);
	}

	input:checked {
		border: 1px solid var(--light-primary);
	}

	input:checked + .container::after {
		opacity: 1;
	}
</style>
