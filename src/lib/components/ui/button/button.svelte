<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '~/lib/utils/utils';
	import { buttonVariants, type Props, type Events } from './';

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let builders: $$Props['builders'] = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(
		buttonVariants({ variant, size, className }),
		'dark:hover:bg-dark_light_grey dark:border-dark_terciary'
	)}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
