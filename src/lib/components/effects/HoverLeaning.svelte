<script lang="ts">
	let card: HTMLDivElement | null = null;

	function setRotate(event: MouseEvent): void {
		if (!card) return;
		const { clientX, clientY } = event;
		const rect = card.getBoundingClientRect();
		const offset = [clientX - rect.left - rect.width / 2, clientY - rect.top - rect.height / 2];

		card.style.transform = `rotateY(${(-offset[0] / rect.width) * 1.3}deg) rotateX(${
			(offset[1] / rect.height) * 1.3
		}deg)`;
	}

	function resetRotate() {
		if (!card) return;
		card.style.transform = `rotateY(0deg) rotateX(0deg)`;
	}
</script>

<div class="perspective" on:mousemove={setRotate} on:mouseleave={resetRotate}>
	<div class="lean" bind:this={card}>
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
		border-radius: inherit;
	}
	.lean:hover {
		transition: transform 0.2s linear;
	}
</style>
