<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import HoverLeaning from '../effects/HoverLeaning.svelte';
	import { tweened } from 'svelte/motion';

	const effectX = tweened(0, {
		duration: 200,
		easing: cubicOut
	});
	const effectY = tweened(0, {
		duration: 200,
		easing: cubicOut
	});
</script>

<!-- class={`card ${color?.startsWith('bg-') ? color : `bg-[${color}]`} ${
					darkColor?.startsWith('bg-')
						? 'dark:' + darkColor
						: `dark:bg-[${darkColor}]`
				}`} -->
<svelte:window
	on:mousemove={(e) => {
		$effectX = e.x;
		$effectY = e.y;
	}}
/>
<section
	class="flex flex-col lg:grid lg:max-h-[700px] px-1 gap-2 lg:gap-[40px]"
>
	<div class="a">
		<HoverLeaning effect={{ x: $effectX, y: $effectY }}>
			<slot name="a" />
		</HoverLeaning>
	</div>
	<div class="b">
		<HoverLeaning effect={{ x: $effectX, y: $effectY }}>
			<slot name="b" />
		</HoverLeaning>
	</div>
	<div class="c">
		<HoverLeaning effect={{ x: $effectX, y: $effectY }}>
			<slot name="c" />
		</HoverLeaning>
	</div>
</section>

<style>
	section {
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}

	.a {
		grid-column: 1 / 3;
		grid-row: 1 / 3;
	}
	.b {
		grid-column: 3 / 6;
		grid-row: 1;
	}
	.c {
		grid-column: 3 / 6;
		grid-row: 2;
	}
</style>
