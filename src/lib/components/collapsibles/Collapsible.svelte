<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';

	export let title: string;
	export let position: 'left' | 'center' | 'right' = 'left';

	const positionsClasses = {
		left: 'mr-auto',
		center: 'mx-auto',
		right: 'ml-auto'
	};

	let contentRef: HTMLDivElement;

	let isOpen = false;

	function toggleCollapsible() {
		isOpen = !isOpen;
	}
</script>

<div class="parent w-fit {positionsClasses[position]} rounded-md bg-base-200">
	<button
		on:click={toggleCollapsible}
		type={'button'}
		class="{positionsClasses[
			position
		]} rounded-md px-4 py-2 w-full flex items-center gap-2 bg-base-300"
		><Icon
			icon="bxs:left-arrow"
			rotate={2}
			class="{isOpen ? 'rotate-90' : 'rotate-0'} duration-300"
		/>
		<span class="text-body3 md:text-body1">{title}</span></button
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
