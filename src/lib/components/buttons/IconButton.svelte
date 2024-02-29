<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import * as Tooltip from '~/lib/components/ui/tooltip/index';
	import Button from '~components/ui/button/button.svelte';

	export let icon: string;
	export let onClick = () => {};
	export let tooltip: string = '';
	export let attr: HTMLButtonAttributes = {};

	let classes = '';
	export { classes as class };
	export let buttonClasses = '';
	export let tooltipClasses = '';
	export let isPortal: `${''}` | undefined = undefined;
</script>

<Tooltip.Root openDelay={300} portal={''}>
	<Tooltip.Trigger asChild let:builder>
		<Button
			type="button"
			builders={[builder]}
			variant="outline"
			on:click={onClick}
			class={twMerge(
				'grid h-fit p-2 aspect-square duration-150 bg-transparent rounded-full hover:bg-light_grey dark:hover:bg-dark_text_white_20 place-content-center disabled:opacity-50',
				classes
			)}
			{...attr}
		>
			<iconify-icon {icon} class={twMerge('text-3xl', buttonClasses)} />
		</Button>
	</Tooltip.Trigger>
	<Tooltip.Content class="z-[100000] bg-light_whiter shadow-md">
		{#if tooltip}
			<span
				class={twMerge(
					'z-[1] p-2 text-light_text_black rounded-sm max-w-[13rem] text-[1rem]',
					tooltipClasses
				)}
			>
				{tooltip}
			</span>
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
