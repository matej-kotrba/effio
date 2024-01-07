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
		asideElement.style.setProperty('--blur-x', `${-9999}px`);
		asideElement.style.setProperty('--blur-y', `${-9999}px`);
		for (let i in inputReferences) {
			inputReferences[i].addEventListener('dragend', (e) => {
				dispatch('drop', { input: inputs[i] });
			});
		}
	});
</script>

<svelte:window on:mousemove={onMouseMove} />
<aside
	class="sticky top-[10%] left-0 w-full parent"
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
					role="listitem"
					class="grid w-full h-full duration-150 place-content-center bg-light_white dark:bg-dark_grey hover:bg-light_whiter dark:hover:bg-dark_light_grey"
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
		grid-template-columns: repeat(2, minmax(120px, 1fr));
	}

	.parent {
		isolation: isolate;
	}

	.item-box {
		aspect-ratio: 1/1;
		position: relative;
		border-radius: 5px;
		display: grid;
		place-items: center;
		box-shadow: 1px 1px 5px var(--light-text-black-40);
		user-select: none;
		cursor: pointer;
		transition: 0.1s scale ease;
	}

	.item-box > div {
		border-radius: inherit;
	}

	.item-box::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: inherit;
		background-attachment: fixed;
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--light-primary),
			transparent 6rem
		);
		z-index: -1;
		pointer-events: none;
	}

	:global(.dark) .item-box::before {
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--dark-primary),
			transparent 6rem
		);
	}

	.item-box > div::after {
		content: '';
		position: absolute;
		inset: 0px;
		border-radius: inherit;
		background-attachment: fixed;
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--light-primary),
			transparent 6rem
		);
		opacity: 0;
		pointer-events: none;
		transition: 0.3s opacity ease;
	}

	:global(.dark) .item-box > div::after {
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--dark-primary),
			transparent 6rem
		);
	}

	.item-box > div:hover::after {
		opacity: 0.1;
	}

	.item-box:active {
		scale: 0.95;
	}

	:global(.dark) .item-box::before {
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--dark-primary),
			transparent 6rem
		);
	}
</style>
