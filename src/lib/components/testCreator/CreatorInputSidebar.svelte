<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import Input from './Input.svelte';

	type Inputs = {
		name: string;
	};

	export let inputs: Inputs[];
	export let containerRef: HTMLElement;

	export { classes as class };
	let classes = '';

	const dispatch = createEventDispatcher();

	// let isDragging = false;
	// let draggableInputIndex: number = -1;

	let inputReferences: {
		[index: number]: HTMLDivElement;
	} = {};

	// function onDragEvent(drag: boolean, index: number) {
	// 	isDragging = drag;
	// 	draggableInputIndex = index;
	// 	dispatch('drag', { isDragging });
	// }

	// function moveDraggedInput(event: MouseEvent) {
	// 	if (!isDragging) return;
	// 	const rect = containerRef.getBoundingClientRect();
	// 	let draggedInput = inputReferenes[draggableInputIndex];
	// 	draggedInput.style.top = `${event.clientY - rect.top}px`;
	// 	draggedInput.style.left = `${event.clientX - rect.left}px`;
	// }

	// onMount(() => {
	// 	let mouseUpListener;
	// 	if (!mouseUpListener) {
	// 		mouseUpListener = window.addEventListener('mouseup', () => onDragEvent(false, -1));
	// 	}

	// 	let mouseMoveListener;
	// 	if (!mouseMoveListener) {
	// 		window.addEventListener('mousemove', (e) => moveDraggedInput(e));
	// 	}
	// 	return () => {
	// 		window.addEventListener('mousemove', (e) => moveDraggedInput(e));
	// 		window.removeEventListener('mouseup', () => onDragEvent(false, -1));
	// 	};
	// });

	$: {
		if (containerRef) {
			// TODO: This may need a cleanup
			// console.log(containerRef);
			// containerRef.addEventListener('dragover', (e) => {
			// 	console.log(e);
			// });
		}
	}

	onMount(() => {
		for (let i in inputReferences) {
			inputReferences[i].addEventListener('dragend', (e) => {
				dispatch('drop', { input: inputs[i] });
			});
		}
	});
</script>

<aside class="relative">
	<div class="sticky top-0 flex flex-col gap-2 p-2 {classes}">
		{#each inputs as input, index (index)}
			<div
				class="relative grid w-full rounded-md shadow-md cursor-pointer select-none aspect-square place-content-center bg-slate-500"
			>
				<!-- on:mousedown={() => onDragEvent(true, index)} -->
				<div
					bind:this={inputReferences[index]}
					draggable="true"
					on:dragstart={(e) => {
						if (e?.dataTransfer) {
							e.dataTransfer.effectAllowed = 'move';
						}
					}}
					class="absolute top-0 left-0 grid w-full duration-100 bg-white border-2 border-solid rounded-md shadow-md cursor-pointer select-none dark:bg-dark_quaternary hover:text-light_primary dark:hover:text-dark_primary hover:bg-slate-100 shadow-light_text_black_40 aspect-square place-content-center border-light_primary dark:border-dark_primary"
				>
					{input.name}
				</div>
			</div>
		{/each}
	</div>
</aside>
