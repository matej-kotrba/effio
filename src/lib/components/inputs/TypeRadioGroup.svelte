<script context="module" lang="ts">
	export type Choice = {
		icon: string;
		title: string;
		description?: string;
	};
</script>

<script lang="ts">
	export let inputGroupName: string;
	export let choices: Choice[];

	export let selectedRadio: string;

	function onButtonSelectRadio(title: string) {
		selectedRadio = title;
	}
</script>

<div class="w-[400px] p-4 flex flex-col gap-2">
	{#each choices as { title, description, icon }}
		<button
			type="button"
			class={`grid items-center gap-4 px-4 py-2 duration-75 border rounded-lg border-light_text_black_10 dark:border-dark_text_white_10 grid__container
        ${
					selectedRadio === title
						? 'bg-light_whiter dark:bg-dark_quaternary'
						: 'bg-light_grey dark:bg-dark_grey hover:bg-light_white dark:hover:bg-dark_light_grey'
				}`}
			on:click={() => onButtonSelectRadio(title)}
		>
			<iconify-icon
				{icon}
				class={'text-2xl duration-100 text-light_text_black_80 dark:text-dark_text_white_80'}
			/>
			<div class="text-left">
				<label for={title}>{title}</label>
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
				value={title}
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
