<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import * as Tooltip from '~/lib/components/ui/tooltip/index';
	import Button from '~components/ui/button/button.svelte';

	export let deleteQuestion: Function;
	export let questionLength: number;
	export let questionLimit: number = 2;
	export { classes as class };
	export let tooltipText: string = '';

	let classes = '';
</script>

<Tooltip.Root openDelay={300}>
	<Tooltip.Trigger asChild let:builder>
		<Button
			type="button"
			builders={[builder]}
			variant="outline"
			on:click={() => deleteQuestion()}
			style="transition: 200ms background-color, 200ms color;"
			disabled={!(questionLength > questionLimit)}
			class={twMerge(
				'grid h-auto group p-2 duration-150 bg-transparent rounded-l-md hover:bg-light_grey dark:hover:bg-dark_text_white_20 place-content-center disabled:opacity-50',
				classes
			)}
		>
			<iconify-icon
				icon="material-symbols:close-rounded"
				class="text-3xl duration-100 group-hover:text-error dark:group-hover:text-dark_error"
				style="transition: 200ms transform;"
			/>
		</Button>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<span>
			{tooltipText || 'Delete answer'}
		</span>
	</Tooltip.Content>
</Tooltip.Root>

<!-- <button
	type="button"
	data-tip={tooltipText || 'Delete answer'}
	class={twMerge(
		`tooltip tooltip-left md:tooltip-top grid px-2 group place-content-center bg-light_white dark:bg-dark_black text-error dark:text-dark_error hover:bg-error hover:text-white rounded-l-md ${
			!(questionLength > questionLimit)
				? 'text-gray-500 hover:text-gray-500 hover:bg-light_white dark:bg-dark_light_grey dark:text-dark_grey'
				: ''
		}`,
		classes
	)}
	disabled={!(questionLength > questionLimit)}
	style="transition: 200ms background-color, 200ms color;"
	on:click={() => deleteQuestion()}
>
	<iconify-icon
		icon="material-symbols:close-rounded"
		class="text-3xl group-hover:rotate-90"
		style="transition: 200ms transform;"
	/>
</button> -->
