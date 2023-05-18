<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Part = {
		title: string;
		onClick: Function;
		buttonProps?: HTMLButtonAttributes & { completed?: boolean };
	};

	export let parts: Part[];
	export let color: string = 'var(--light-primary)';

	let activeCount: number = 1;
	let underlineDiv: HTMLDivElement;
	let sectionElement: HTMLElement;

	// Sets the active button and position of underline div and calls setPosition
	function setToActive(
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		},
		index: number
	) {
		activeCount = index;
		setPosition(event.currentTarget.getBoundingClientRect());
	}

	// Sets position of underline div to the position of the button
	function setPosition(itemRect: DOMRect) {
		underlineDiv.style.left = `${itemRect.left - sectionElement.offsetLeft}px`;
		underlineDiv.style.width = `${itemRect.width}px`;
	}

	onMount(() => {
		setPosition(sectionElement.children[0].getBoundingClientRect());
	});
</script>

<section class="relative flex gap-4" bind:this={sectionElement}>
	{#each parts as part, index}
		<button
			type="button"
			{...part.buttonProps}
			class:disabled={part?.buttonProps?.disabled}
			class:completed={part?.buttonProps?.completed}
			on:click={(event) => {
				setToActive(event, index + 1);
				part.onClick();
			}}>{part.title}</button
		>
	{/each}
	<div
		bind:this={underlineDiv}
		class="absolute w-0 h-1 duration-200 origin-center top-[100%] rounded-full"
		style="background-color: {color};"
	/>
</section>

<style>
	.disabled {
		color: var(--light-text-black-40);
	}
	.completed {
		color: var(--light-primary);
	}
</style>
