<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Part = {
		title: string;
		onClick: Function;
		buttonProps?: HTMLButtonAttributes & { completed?: boolean };
	};

	export let parts: Part[];

	let activeCount: number = 1;
	let underlineDiv: HTMLDivElement;
	let sectionElement: HTMLElement;

	export let activeIndex: number = 0;
	export let defaultActiveIndex: number = 0;

	activeCount = defaultActiveIndex + 1;
	$: activeIndex = activeCount - 1;

	// Sets the active button and position of underline div and calls setPosition
	function setToActive(
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		},
		index: number
	) {
		activeCount = index;
		setPosition(event.currentTarget);
	}

	// Sets position of underline div to the position of the button
	function setPosition(itemRect: HTMLElement) {
		// underlineDiv.style.left = `${itemRect.left - sectionElement.offsetLeft}px`;
		sectionElement.style.setProperty('--translate', `${itemRect.offsetLeft}px`);
		underlineDiv.style.width = `${itemRect.clientWidth}px`;
	}

	onMount(() => {
		setPosition(sectionElement.children[defaultActiveIndex] as HTMLElement);
	});
</script>

<section
	class="relative flex gap-4"
	style="--translate: 0px;"
	bind:this={sectionElement}
>
	{#each parts as part, index}
		<button
			type="button"
			{...part.buttonProps}
			class:disabled={part?.buttonProps?.disabled}
			class:completed={part?.buttonProps?.completed}
			class={`text-body2 md:text-body1 px-2 py-1 rounded-t-md duration-150 ${
				activeCount - 1 === index
					? 'bg-light_grey_dark dark:bg-dark_light_grey'
					: ''
			}`}
			on:click={(event) => {
				setToActive(event, index + 1);
				part.onClick();
			}}>{part.title}</button
		>
	{/each}
	<div
		bind:this={underlineDiv}
		class="underline_effect absolute w-0 h-[2px] duration-200 origin-center top-[100%] rounded-full bg-light_primary dark:bg-dark_primary"
	/>
</section>

<style>
	.underline_effect {
		transform: translateX(var(--translate, 0));
	}
	.disabled {
		color: var(--light-text-black-40);
	}
	.completed {
		color: var(--light-primary);
	}
	:global(.dark) .completed {
		color: var(--dark-primary) !important;
	}
</style>
