<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };

	export let count: number;

	const tweenedCount = tweened(0, {
		duration: 3000,
		easing: cubicOut,
		interpolate(from, to) {
			return (t) => +((to - from) * t + from).toFixed(0);
		}
	});

	$: tweenedCount.set(count);
</script>

<div
	class={twMerge(
		'relative grid w-20 p-2 overflow-hidden bg-light_white dark:bg-dark_light_grey shadow-md rounded-full place-content-center aspect-square',
		classes
	)}
>
	{#key $tweenedCount}
		<span
			class="absolute font-bold text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-h3"
			in:fly={{ y: -100, x: 0, duration: 250 }}
			out:fly={{ y: 100, x: 0, duration: 150 }}
		>
			{$tweenedCount}
		</span>
	{/key}
</div>
