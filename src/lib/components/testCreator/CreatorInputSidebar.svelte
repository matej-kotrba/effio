<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import Input from './Input.svelte';

	type Inputs = {
		name: string;
	};

	export let inputs: Inputs[];

	export { classes as class };
	let classes = '';

	const dispatch = createEventDispatcher();

	let containerRef: HTMLElement;

	let isDragging = false;
	let draggableInputIndex: number = -1;

	let inputReferenes: {
		[index: number]: HTMLDivElement;
	} = {};

	function onDragEvent(drag: boolean, index: number) {
		isDragging = drag;
		draggableInputIndex = index;
		dispatch('drag', { isDragging });
	}

	function moveDraggedInput(event: MouseEvent) {
		if (!isDragging) return;
		const rect = containerRef.getBoundingClientRect();
		let draggedInput = inputReferenes[draggableInputIndex];
		draggedInput.style.top = `${event.clientY - rect.top}px`;
		draggedInput.style.left = `${event.clientX - rect.left}px`;
	}

	onMount(() => {
		let mouseUpListener;
		if (!mouseUpListener) {
			mouseUpListener = window.addEventListener('mouseup', () => onDragEvent(false, -1));
		}

		let mouseMoveListener;
		if (!mouseMoveListener) {
			window.addEventListener('mousemove', (e) => moveDraggedInput(e));
		}
		return () => {
			window.addEventListener('mousemove', (e) => moveDraggedInput(e));
			window.removeEventListener('mouseup', () => onDragEvent(false, -1));
		};
	});
</script>

<div class="relative">
	<div class="sticky top-0 flex flex-col gap-2 p-2 {classes}" bind:this={containerRef}>
		{#each inputs as input, index (index)}
			<div
				class="relative grid w-full rounded-md shadow-md cursor-pointer select-none aspect-square place-content-center bg-slate-500"
			>
				<div
					bind:this={inputReferenes[index]}
					on:mousedown={() => onDragEvent(true, index)}
					class="absolute top-0 left-0 grid w-full bg-white rounded-md shadow-md cursor-pointer select-none shadow-light_text_black_40 aspect-square place-content-center"
				>
					{input.name}
				</div>
			</div>
		{/each}
	</div>
</div>
