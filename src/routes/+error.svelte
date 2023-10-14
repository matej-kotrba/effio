<div class="grid h-screen place-content-center">
	<span
		class="text-center text-9xl text-light_text_black_60 dark:text-dark_text_white_60 anim"
	>
		<span>4</span><span class="relative z-10 dark:bg-dark_black">0</span><span
			>4</span
		>
	</span>
	<div class="flex items-center gap-2">
		<button type="button" on:click={history.back} class="btn btn-outline">
			<iconify-icon icon="vaadin:arrow-backward" class="text-3xl" />
		</button>
		<a href="/" class="btn btn-outline"> Back to homepage </a>
	</div>
</div>

<style>
	.anim > span {
		display: inline-block;
	}

	.anim > span:nth-of-type(2) {
		mask-image: radial-gradient(circle at center, black 80%, transparent);
	}

	.anim > span:first-of-type {
		animation: anim 1s ease-in-out;
	}

	.anim > span:last-of-type {
		animation: anim2 1s ease-in-out;
	}

	/* .anim > span:first-of-type, .anim > span:last-of-type {
    opacity: 0;
  } */

	@keyframes anim {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes anim2 {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
