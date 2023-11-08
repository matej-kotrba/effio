<script>
	import { fade } from 'svelte/transition';
	import Space from '~components/separators/Space.svelte';
</script>

<div
	transition:fade={{ duration: 150 }}
	class="group flex flex-col justify-between gap-2 text-center bg-white dark:bg-dark_grey
	 shadow-md w-full max-w-[300px] text-light_text_black dark:text-dark_text_white p-2 rounded-md relative min-h-[180px] overflow-hidden
	 duration-150"
>
	<div>
		<div
			class="w-[30%] h-5 ml-auto mb-2 rounded-md skeleton bg-zinc-200 dark:bg-dark_light_grey"
		/>
		<Space gap={30} />
		<div
			class="skeleton w-[60%] h-5 mx-auto mb-2 rounded-md bg-zinc-200 dark:bg-dark_light_grey"
		/>
		<p
			class="max-w-[80%] w-[80%] h-4 mx-auto skeleton mb-1 rounded-md bg-zinc-200 dark:bg-dark_light_grey"
		/>
		<p
			class="max-w-[80%] w-[80%] h-4 mx-auto skeleton rounded-md bg-zinc-200 dark:bg-dark_light_grey"
		/>
	</div>
</div>

<style>
	.skeleton {
		overflow: hidden;
		position: relative;
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
