<script lang="ts">
	import { onMount } from 'svelte';

	export let effect: { x: number; y: number };

	let card: HTMLDivElement | null = null;
	let rect: DOMRect | undefined = undefined;
	export let noLean: boolean = false;
	export let noStyles: boolean = false;

	function setRotate(event: MouseEvent): void {
		if (noLean) return;
		if (!card) return;
		const { clientX, clientY } = event;
		const rect = card.getBoundingClientRect();
		const offset = [
			clientX - rect.left - rect.width / 2,
			clientY - rect.top - rect.height / 2
		];

		card.style.transform = `rotateY(${
			(-offset[0] / rect.width) * 1.2
		}deg) rotateX(${(offset[1] / rect.height) * 1.2}deg)`;
	}

	function resetRotate() {
		if (!card) return;
		card.style.transform = `rotateY(0deg) rotateX(0deg)`;
	}

	$: rect && card?.style.setProperty('--x', `${effect.x - rect.left}px`);
	$: rect && card?.style.setProperty('--y', `${effect.y - rect.top}px`);

	onMount(() => {
		rect = card?.getBoundingClientRect();

		window.addEventListener('scroll', () => {
			rect = card?.getBoundingClientRect();
		});

		window.addEventListener('resize', () => {
			rect = card?.getBoundingClientRect();
		});

		return () => {
			window.removeEventListener('scroll', () => {
				rect = card?.getBoundingClientRect();
			});

			window.removeEventListener('resize', () => {
				rect = card?.getBoundingClientRect();
			});
		};
	});
</script>

<!-- <svelte:window
	on:mousemove={(e) => {
		if (!card) return;
		const rect = card.getBoundingClientRect();
		card.style.setProperty('--x', `${e.x - rect.left}px`);
		card.style.setProperty('--y', `${e.y - rect.top}px`);
	}}
/> -->

<div
	class="perspective"
	role="application"
	on:mousemove={setRotate}
	on:mouseleave={resetRotate}
>
	<div
		class={`${
			noStyles === false
				? 'overflow-hidden outline-8 outline lean bg-light_white outline-light_terciary dark:outline-dark_secondary dark:bg-dark_terciary'
				: 'h-full'
		}`}
		style={`--x: 0; --y: 0; transform-style: ${
			noLean ? 'flat' : 'preserve-3d'
		};`}
		bind:this={card}
	>
		<slot />
	</div>
</div>

<style>
	.perspective {
		height: 100%;
		perspective: 100px;
	}
	.lean {
		height: inherit;
		transform-style: preserve-3d;
		transform: rotateY(0deg) rotateX(0deg);
		transition: transform 0.3s linear;
		isolation: isolate;
		position: relative;
		border-radius: 40px;
		padding: 40px;
	}
	.lean:hover {
		transition: transform 0.2s linear;
	}
	.lean::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(
			circle at var(--x, 0) var(--y, 0),
			var(--light-terciary) -60%,
			transparent 10rem
		);
		border-radius: 40px;
		background-attachment: fixed;
		z-index: -1;
		pointer-events: none;
	}
	:global(.dark) .lean::before {
		background-image: radial-gradient(
			circle at var(--x, 0) var(--y, 0),
			var(--dark-secondary) -60%,
			transparent 10rem
		);
	}
</style>
