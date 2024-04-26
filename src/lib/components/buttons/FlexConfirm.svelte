<script lang="ts">
	import type { ButtonProps } from 'bits-ui';
	import * as Tooltip from '~components/ui/tooltip';
	import { cn } from '~utils/utils';

	type $$Props = ButtonProps & {
		onClick: (
			e: MouseEvent & {
				currentTarget: EventTarget & HTMLButtonElement;
			}
		) => void;
		buttonTooltip?: string;
	};
	let classes: $$Props['class'] = undefined;

	export let onClick: $$Props['onClick'];
	export let buttonTooltip: $$Props['buttonTooltip'] = '';
	export { classes as class };
</script>

<div class="fixed bottom-5 right-5 z-[100]">
	<Tooltip.Root>
		<Tooltip.Trigger>
			<button
				type="button"
				{...$$restProps}
				on:click={onClick}
				class={cn(
					`group  rounded-full bg-light_terciary dark:bg-dark_secondary border-2 border-solid border-light_text_black_20
		 shadow-md p-6 grid place-content-center  hover:bg-light_white dark:hover:bg-dark_light_grey duration-100
		 dark:border-dark_text_white_20 disabled:bg-light_grey disabled:border-light_text_black_20
		 dark:disabled:bg-dark_grey dark:disabled:border-dark_text_white_20`,
					classes
				)}
			>
				<slot />
			</button>
		</Tooltip.Trigger>
		{#if buttonTooltip}
			<Tooltip.Content>{buttonTooltip}</Tooltip.Content>
		{/if}
	</Tooltip.Root>
</div>
