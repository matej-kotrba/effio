<div class="container">
	<div class="card-container">
		<div class="logo-container">
			<img src="./imgs/effio/text.png" alt="" class="logo" />
			<h3 class="text-white">Create a new test</h3>
		</div>
		<img src="./imgs/svgs/empty.svg" alt="" class="main-image" />
		<img src="./imgs/overview/bg2.svg" alt="" class="bg-image" />
	</div>
</div>

<style>
	:root {
		--rotation: 35deg;
		--timing: 0.4s;
		--radius: 12px;
	}

	.container {
		width: fit-content;
		perspective: 1000px;
	}

	.card-container {
		width: 250px;
		aspect-ratio: 2 / 3;
		position: relative;
		transform-style: preserve-3d;
		transition: rotate var(--timing) ease;
	}

	.card-container:hover {
		rotate: x var(--rotation);
	}

	.card-container::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 100;
		background-image: radial-gradient(
			circle,
			transparent 120px,
			rgba(0, 0, 0, 0.46)
		);
		opacity: 0;
		transition: opacity var(--timing);
		border-radius: var(--radius);
	}

	.card-container:hover::before {
		opacity: 1;
	}

	.card-container::after {
		content: '';
		position: absolute;
		inset: 80% 0.3rem 0.3rem;
		translate: 0;
		transform: translateZ(-100px);
		background: rgba(0, 0, 0, 0.677);
		filter: blur(1rem);
		z-index: 1;
		transition: rotate var(--timing), translate var(--timing);
	}

	.card-container:hover::after {
		rotate: x calc(var(--rotation) * -1);
		translate: 0 60px;
	}

	.bg-image {
		position: absolute;
		z-index: 10;
		height: 100%;
		width: 100%;
		object-fit: cover;
		border-radius: var(--radius);
	}

	.logo-container,
	.main-image {
		position: absolute;
	}

	.logo-container {
		z-index: 1000;
		filter: brightness(1000) drop-shadow(rgba(0, 0, 0, 0.671) 0 0 1px);
		width: 65%;
		margin-inline: auto;
		inset: auto 0 2rem;
		transform: translateY(0rem) translateZ(20px);
		transition: var(--timing);
	}

	.logo {
	}

	.card-container:hover .logo-container {
		transform: translateY(-1.5rem) translateZ(20px);
		rotate: x calc(var(--rotation) * -1);
	}

	.main-image {
		scale: 1.125;
		transform-origin: bottom;
		opacity: 0;
		z-index: 100;
		transition: var(--timing);
	}

	.card-container:hover .main-image {
		opacity: 1;
		transform: translateY(-2rem) translateZ(-10px);
		rotate: x calc(var(--rotation) * -1);
	}
</style>
