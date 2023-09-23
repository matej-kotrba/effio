<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	type Inputs = {
		name: string;
	};

	export let inputs: Inputs[];

	export { classes as class };
	let classes = '';

	let asideWidth: number;

	let asideElement: HTMLElement;

	const dispatch = createEventDispatcher();

	let inputReferences: {
		[index: number]: HTMLDivElement;
	} = {};

	function onMouseMove(
		e: MouseEvent & {
			currentTarget: EventTarget & Window;
		}
	) {
		asideElement.style.setProperty('--blur-x', `${e.x}px`);
		asideElement.style.setProperty('--blur-y', `${e.y}px`);
	}

	onMount(() => {
		for (let i in inputReferences) {
			inputReferences[i].addEventListener('dragend', (e) => {
				dispatch('drop', { input: inputs[i] });
			});
		}
	});
</script>

<svelte:window on:mousemove={onMouseMove} />
<aside
	class="sticky top-0 w-full h-full parent"
	style="--blur-x: 0px;
		--blur-y: 0px;"
	bind:clientWidth={asideWidth}
	bind:this={asideElement}
>
	<div class="grid gap-2 p-2 grid__container {classes}">
		{#each inputs as input, index (index)}
			<div class="item-box">
				<!-- class="relative grid w-full rounded-md shadow-md cursor-pointer select-none aspect-square place-content-center bg-slate-500" -->
				<!-- on:mousedown={() => onDragEvent(true, index)} -->
				<div
					class=""
					bind:this={inputReferences[index]}
					draggable="true"
					on:dragstart={(e) => {
						if (e?.dataTransfer) {
							e.dataTransfer.effectAllowed = 'move';
						}
					}}
				>
					<!-- class="absolute top-0 left-0 grid w-full duration-100 bg-white border-2 border-solid rounded-md shadow-md cursor-pointer select-none dark:bg-dark_quaternary hover:text-light_primary dark:hover:text-dark_primary hover:bg-slate-100 dark:hover:bg-dark_terciary shadow-light_text_black_40 aspect-square place-content-center border-light_primary dark:border-dark_primary" -->
					{input.name}
				</div>
			</div>
		{/each}
	</div>
</aside>

<style>
	.grid__container {
		grid-template-columns: repeat(auto-fit, 150px);
	}

	.parent {
		position: relative;
		isolation: isolate;
	}

	.item-box {
		aspect-ratio: 1/1;
		position: relative;
		background-color: royalblue;
		border-radius: 5px;
	}

	.item-box::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: inherit;
		background-attachment: fixed;
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			hsl(0 0% 100% / 0.75),
			transparent 8rem
		);
		z-index: -1;
		pointer-events: none;
	}
</style>
