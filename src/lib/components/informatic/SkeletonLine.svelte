<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };
</script>

<div class={twMerge('mx-auto h-6 w-6 rounded-md skeleton', classes)} />

<style>
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
