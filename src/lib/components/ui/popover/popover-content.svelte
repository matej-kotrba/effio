<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '~/lib/utils/utils';

	type $$Props = PopoverPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = undefined;
	export let align: $$Props['align'] = 'center';
	export let sideOffset: $$Props['sideOffset'] = 4;
	export { className as class };
</script>

<PopoverPrimitive.Content
	{transition}
	{transitionConfig}
	{align}
	{sideOffset}
	{...$$restProps}
	class={cn(
		'z-50 w-72 rounded-md border bg-popover dark:bg-dark_black dark:border-dark_text_white_20 p-4 text-popover-foreground dark:text-dark_text_white_80 shadow-md outline-none',
		className
	)}
>
	<slot />
</PopoverPrimitive.Content>
