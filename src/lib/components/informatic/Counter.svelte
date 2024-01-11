<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { get } from 'svelte/store';

	let classes = '';
	export { classes as class };
	export let numberClasses = '';
	export let color = '';

	export let count: number;

	const tweenedCount = tweened(0, {
		duration: 3000,
		easing: cubicOut,
		interpolate(from, to) {
			return (t) => +((to - from) * t + from).toFixed(0);
		}
	});

	$: {
		const oldState = get(tweenedCount);
		if (Math.abs(oldState - count) > 100) {
			tweenedCount.set(count - 100, { duration: 0 });
		}
		tweenedCount.set(count);
	}
</script>

<div
	class={twMerge(
		'relative flex items-center w-fit min-w-20 p-2 overflow-hidden bg-light_white dark:bg-dark_light_grey shadow-md rounded-full aspect-square',
		classes
	)}
>
	<!-- Placeholder value -->
	<span class="font-bold text-center opacity-0 pointer-events-none text-h3"
		>{count}</span
	>
	{#key $tweenedCount}
		<span
			style="color: {color}"
			class={twMerge(
				'absolute font-bold text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-h3',
				numberClasses
			)}
			in:fly={{ y: -100, x: 0, duration: 250 }}
			out:fly={{ y: 100, x: 0, duration: 150 }}
		>
			{$tweenedCount}
		</span>
	{/key}
</div>
