<script lang="ts">
	import Space from '~components/separators/Space.svelte';
</script>

<div
	class="max-w-[300px] aspect-[4/5] flex flex-col justify-between w-full p-3 bg-white dark:bg-dark_light_grey rounded-lg card_bg shadow-surrounding"
>
	<div>
		<div class="relative block group">
			<div class="overflow-hidden rounded-lg">
				<div
					class="rounded-lg w-[100%] aspect-[3/2] overflow-hidden duration-200
						grid place-content-center skeleton"
				/>
			</div>
		</div>
		<Space gap={10} />
		<div class="flex flex-col gap-2">
			<div class="mx-auto w-[60%] h-6 rounded-md skeleton" />
			<div class="mx-auto w-[90%] h-4 rounded-md skeleton" />
			<div class="mx-auto w-[90%] h-4 rounded-md skeleton" />
			<div class="mx-auto w-[90%] h-4 rounded-md skeleton" />
		</div>
	</div>
</div>

<style>
	.card_bg {
		/* background-image: url('/imgs/svgs/card_bg.svg'); */
		/* box-shadow: 3px 1px 15px var(--light-text-black-40); */
	}

	.skeleton {
		@apply bg-zinc-200;
		overflow: hidden;
		position: relative;
	}

	:global(.dark) .skeleton {
		@apply bg-dark_grey;
	}

	.skeleton::before {
		content: '';
		position: absolute;
		width: 15%;
		height: 120%;
		background-color: white;
		left: -15%;
		top: -10%;
		animation: move-x 2.5s infinite linear;
		rotate: 12deg;
		filter: blur(20px);
	}

	:global(.dark) .skeleton::before {
		background-color: var(--dark-text-white-20);
	}

	@keyframes move-x {
		0% {
			left: -35%;
		}
		50% {
			left: 120%;
		}
		100% {
			left: 120%;
		}
	}
</style>
