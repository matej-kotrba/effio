<script context="module" lang="ts">
	export type Choice = {
		icon: string;
		title: string;
		value: string;
		description?: string;
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let inputGroupName: string;
	export let choices: Choice[];

	export let selectedRadio: string = choices[0].value;

	let classes = '';
	export { classes as class };

	$: {
		if (selectedRadio === undefined) {
			selectedRadio = choices[0].value;
		}
	}

	function onButtonSelectRadio(value: string) {
		selectedRadio = value;
	}
</script>

<div class={twMerge(`flex flex-col gap-2`, classes)}>
	{#each choices as { title, description, icon, value }}
		<button
			type="button"
			class={`grid items-center gap-4 px-4 py-2 duration-75 border rounded-lg border-light_text_black_10 dark:border-dark_text_white_10 grid__container
        ${
					selectedRadio === value
						? 'bg-light_whiter dark:bg-dark_quaternary'
						: 'bg-light_grey dark:bg-dark_grey hover:bg-light_white dark:hover:bg-dark_light_grey'
				}`}
			on:click={() => onButtonSelectRadio(value)}
		>
			<iconify-icon
				{icon}
				class={'text-2xl duration-100 text-light_text_black_80 dark:text-dark_text_white_80'}
			/>
			<div class="text-left">
				<label for={value} class="cursor-pointer">{title}</label>
				<p
					class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
				>
					{description}
				</p>
			</div>
			<input
				type="radio"
				id={title.toLowerCase()}
				name={inputGroupName}
				{value}
				tabindex="-1"
				class="radio checked:bg-light_text_black dark:checked:bg-dark_text_white dark:border-dark_text_white_40"
				bind:group={selectedRadio}
			/>
		</button>
	{/each}
</div>

<style>
	.grid__container {
		grid-template-columns: auto 1fr auto;
	}
	:global(.dark) .radio {
		--b1: 25% 0 11;
	}
</style>
