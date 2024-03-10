<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import Separator from '~components/separators/Separator.svelte';

	type Inputs = {
		name: string;
		icon: string;
	};

	export let inputs: Inputs[];

	export { classes as class };
	let classes = '';

	let asideWidth: number;
	let asidePaddingTop: number = 0;

	let asideElement: HTMLElement;

	let isTipVisible = false;

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

	function onAknowladgeDragTip() {
		isTipVisible = false;
		localStorage?.setItem('creatorInputDragTipVisible', 'false');
	}

	function setSidebarPosition() {
		const bounding = asideElement.getBoundingClientRect();
		let height =
			Math.min(bounding.bottom, window.innerHeight) - Math.max(bounding.top, 0);
		asidePaddingTop = (window.innerHeight - height) / 2;
	}

	onMount(() => {
		if (localStorage?.getItem('creatorInputDragTipVisible') === 'false') {
			isTipVisible = false;
		} else {
			isTipVisible = true;
		}
		asideElement.style.setProperty('--blur-x', `${-9999}px`);
		asideElement.style.setProperty('--blur-y', `${-9999}px`);
		for (let i in inputReferences) {
			inputReferences[i].addEventListener('dragend', (e) => {
				dispatch('drop', { input: inputs[i] });
			});
		}

		window.addEventListener('scroll', setSidebarPosition);
		window.addEventListener('resize', setSidebarPosition);

		return () => {
			window.removeEventListener('scroll', setSidebarPosition);
			window.removeEventListener('resize', setSidebarPosition);
		};
	});
</script>

<svelte:window on:mousemove={onMouseMove} />
<aside
	class="sticky left-0 w-full parent z-10 max-h-[100vh] overflow-y-auto"
	style="--blur-x: 0px; --blur-y: 0px; top: {asidePaddingTop}px;"
	bind:clientWidth={asideWidth}
	bind:this={asideElement}
>
	<div class={`${isTipVisible === false ? 'hidden' : 'visible'}`}>
		<div
			class="absolute z-[90] bg-light_grey dark:bg-dark_light_grey shadow-md rounded-lg p-2 bottom-full
		before:content-[''] before:w-4 before:aspect-square before:bg-light_grey dark:before:bg-dark_light_grey
		before:top-full before:left-1/2 before:translate-x-[-50%] before:absolute clipped_marker"
		>
			<div
				class="flex items-center gap-1 text-light_text_black_80 dark:text-dark_text_white_80"
			>
				<iconify-icon icon="fluent-emoji-flat:light-bulb" class="text-2xl" /> Tip!
			</div>
			<Separator w={'100%'} h={'1px'} class={'bg-light_text_black_10'} />
			<p>Add new inputs by dragging them into the field.</p>
			<button
				type="button"
				on:click={onAknowladgeDragTip}
				class="block ml-auto text-white dark:text-white btn btn-primary dark:btn-accent"
				>Got it!</button
			>
		</div>
		<div class="absolute z-[100] top-6 left-6">
			<iconify-icon
				icon="pepicons-pencil:hand-grab"
				class="absolute top-0 left-0 text-6xl grab-anim"
			/>
			<iconify-icon
				icon="pepicons-pencil:hand-point"
				class="absolute top-0 left-0 text-6xl -rotate-12 pointer-anim"
			/>
		</div>
	</div>
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
					<iconify-icon
						icon={input.icon}
						class="mx-auto text-3xl text-light_text_black_80 dark:text-dark_text_white_80"
					/>
					<span class="text-center">
						{input.name}
					</span>
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

	.clipped_marker::before {
		clip-path: polygon(50% 100%, 0 0, 100% 0);
	}

	.pointer-anim {
		animation: pointer 5s infinite ease;
	}

	.grab-anim {
		animation: grab 5s infinite ease;
	}

	@keyframes pointer {
		0% {
			transform: translateX(0%);
			display: block;
			opacity: 0;
		}
		49.9% {
			opacity: 0;
		}
		50% {
			transform: translateX(400%);
			opacity: 1;
		}
		99.9% {
			opacity: 1;
		}
		100% {
			transform: translateX(0%);
			opacity: 0;
		}
	}
	@keyframes grab {
		0% {
			transform: translateX(0%);
			opacity: 1;
		}
		49.9% {
			opacity: 1;
		}
		50% {
			opacity: 0;
			transform: translateX(400%);
		}
		100% {
			opacity: 0;
		}
	}
</style>
