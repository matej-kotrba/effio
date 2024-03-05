<script lang="ts">
	import DragHandleDots2 from 'svelte-radix/DragHandleDots2.svelte';
	import * as ResizablePrimitive from 'paneforge';
	import { cn } from '~utils/utils';
	import { createEventDispatcher } from 'svelte';

	type $$Props = ResizablePrimitive.PaneResizerProps & {
		withHandle?: boolean;
	};

	export let withHandle: $$Props['withHandle'] = false;
	export let el: $$Props['el'] = undefined;
	let className: $$Props['class'] = undefined;
	export { className as class };

	const dispatch = createEventDispatcher();

	function onResize(isDragging: boolean) {
		dispatch('resizedContainer', { isDragging: isDragging });
	}
</script>

<ResizablePrimitive.PaneResizer
	onDraggingChange={onResize}
	bind:el
	class={cn(
		'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0 [&[data-direction=vertical]>div]:rotate-90',
		className
	)}
>
	{#if withHandle}
		<div
			class="z-10 flex items-center justify-center w-3 h-4 border rounded-sm bg-border"
		>
			<DragHandleDots2 class="h-2.5 w-2.5" />
		</div>
	{/if}
</ResizablePrimitive.PaneResizer>
