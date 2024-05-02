<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { twMerge } from 'tailwind-merge';

	export let title: string;
	export let openedTitle: string | undefined = undefined;
	export let position: 'left' | 'center' | 'right' = 'left';
	export let shouldWrap = true;
	let classes = '';
	export { classes as class };
	export let buttonClasses = '';
	export let onOpen: Function = () => {};

	const positionsClasses = {
		left: 'mr-auto',
		center: 'mx-auto',
		right: 'ml-auto'
	};

	let contentRef: HTMLDivElement;

	let isOpen = false;

	function toggleCollapsible() {
		isOpen = !isOpen;
		if (isOpen === true) {
			onOpen();
		}
	}
</script>

<div
	class={twMerge(
		`parent w-fit ${positionsClasses[position]} rounded-md bg-gray-100 dark:bg-zinc-900`,
		classes
	)}
>
	<button
		on:click={toggleCollapsible}
		type={'button'}
		class={twMerge(
			`${positionsClasses[position]} rounded-md px-4 py-2 w-full flex items-center gap-2 bg-gray-200 dark:bg-dark_light_grey duration-150 text-light_text_black dark:text-dark_text_white`,
			buttonClasses
		)}
	>
		<iconify-icon
			icon="bxs:left-arrow"
			rotate={2}
			class="{isOpen ? 'rotate-90' : 'rotate-0'} duration-300"
		/>
		<abbr
			title={isOpen && openedTitle ? openedTitle : title}
			class="overflow-hidden no-underline text-ellipsis"
		>
			<span
				class={`text-body3 md:text-body1 min-h-[1.2em] text-left ${
					shouldWrap === false ? 'whitespace-nowrap  ' : ''
				}`}>{isOpen && openedTitle ? openedTitle : title}</span
			></abbr
		></button
	>
	<div class="content" class:active={isOpen} bind:this={contentRef}>
		<div class="px-4">
			<Space gap={10} />
			<slot />
			<Space gap={10} />
		</div>
	</div>
</div>

<style>
	.content {
		display: grid;
		grid-template-rows: 0fr;
		transition: 0.3s grid-template-rows ease;
	}

	.content > div {
		overflow: hidden;
	}

	.content.active {
		grid-template-rows: 1fr;
	}
</style>
