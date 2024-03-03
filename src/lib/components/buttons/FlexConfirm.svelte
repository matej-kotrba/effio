<script lang="ts">
	import type { ButtonProps } from 'bits-ui';
	import { cn } from '~utils/utils';

	type $$Props = ButtonProps & {
		onClick: (
			e: MouseEvent & {
				currentTarget: EventTarget & HTMLButtonElement;
			}
		) => void;
	};
	let classes: $$Props['class'] = undefined;

	export let onClick: $$Props['onClick'];
	export { classes as class };
</script>

<button
	type="button"
	{...$$restProps}
	on:click={onClick}
	class={cn(
		'fixed bottom-5 right-5 rounded-full bg-light_white border-2 border-solid border-light_text_black_20 shadow-md p-6 grid place-content-center z-[100]',
		classes
	)}
>
	<slot />
</button>
