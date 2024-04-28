<script lang="ts">
	import type { ButtonProps } from '~components/ui/button';
	import * as Tooltip from '~components/ui/tooltip';

	type $$Props = ButtonProps & {
		onClick: (
			e: MouseEvent & {
				currentTarget: EventTarget & HTMLButtonElement;
			}
		) => void;
		title: string;
	};

	export let onClick: $$Props['onClick'];
	export let title: string;
</script>

<Tooltip.Root openDelay={100}>
	<Tooltip.Trigger>
		<button
			type="button"
			on:click={onClick}
			{...$$restProps}
			class="grid p-2 duration-100 bg-light_grey place-content-center hover:bg-light_grey_dark"
		>
			<slot />
		</button>
	</Tooltip.Trigger>
	{#if title}
		<Tooltip.Content>{title}</Tooltip.Content>
	{/if}
</Tooltip.Root>
