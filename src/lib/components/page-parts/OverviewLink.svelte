<script lang="ts">
	export let title: string;
	export let link: string;
	export let icon: string;
	export let bgImage: string;
</script>

<a href={link}>
	<div class="container">
		<div
			class="card-container max-w-[150px] md:max-w-[250px] w-screen aspect-[2/3]"
		>
			<iconify-icon
				{icon}
				class="text-light_primary drop-shadow-sm left-1/2 text-8xl main-image"
			/>
			<!-- <img src="./imgs/svgs/empty.svg" alt="" class="bottom-0 main-image" /> -->
			<div class="w-full px-1 logo-container">
				<img src="./imgs/effio/text.png" alt="" class="w-3/4 mx-auto" />
				<h3
					class="font-semibold text-center text-white text-body2 md:text-body1"
				>
					{title}
				</h3>
			</div>
			<div class="p-2 bg-image bg-light_terciary dark:bg-dark_primary_dark">
				<img
					src={bgImage}
					alt=""
					class="drop-shadow-md w-[80%] md:w-full mx-auto"
				/>
			</div>
			<!-- <img src="./imgs/overview/bg2.svg" alt="" class="bg-image" /> -->
		</div>
	</div>
</a>

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
		filter: brightness(1000) drop-shadow(rgba(0, 0, 0, 0.671) 0 0 1px);
		margin-inline: auto;
		z-index: 100;
		inset: auto 0 2rem;
		transform: translateY(0rem) translateZ(20px);
		transition: var(--timing);
	}

	.card-container:hover .logo-container {
		transform: translateY(-1.5rem) translateZ(30px);
		rotate: x calc(var(--rotation) * -1);
	}

	.main-image {
		scale: 1;
		transform-origin: bottom;
		opacity: 0;
		z-index: 10;
		transition: var(--timing);
		transform: translateX(-50%) translateY(0rem) translateZ(0px);
	}

	.card-container:hover .main-image {
		opacity: 1;
		transform: translateX(-50%) translateY(-4rem) translateZ(60px);
		rotate: x calc(var(--rotation) * -1);
	}
</style>
