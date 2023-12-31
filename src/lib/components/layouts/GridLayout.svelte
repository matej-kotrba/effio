<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import HoverLeaning from '../effects/HoverLeaning.svelte';
	import { tweened } from 'svelte/motion';
	import { twMerge } from 'tailwind-merge';

	type GridString = `${number} / ${number}`;
	type GridArea = {
		rows: GridString;
		columns: GridString;
	};

	export let id: string = '';
	export let customLayout:
		| {
				a: GridArea;
				b: GridArea;
				c: GridArea;
		  }
		| undefined = undefined;

	type LayoutOptions = {
		withoutStyle?: boolean;
		withoutLean?: boolean;
	};

	export let layoutOptions:
		| {
				a?: LayoutOptions;
				b?: LayoutOptions;
				c?: LayoutOptions;
		  }
		| undefined = undefined;

	export let layoutStyles: {
		a?: string;
		b?: string;
		c?: string;
	} = {};

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
	class="flex flex-col lg:grid lg:max-h-[700px] px-1 gap-8 lg:gap-[40px]"
	{...id !== '' ? { id } : {}}
>
	<div
		class={twMerge('a', layoutStyles['a'])}
		style={`${
			customLayout && customLayout['a']
				? `grid-column: ${customLayout['a']['columns']}; grid-row: ${customLayout['a']['rows']}`
				: ''
		}`}
	>
		<HoverLeaning
			noLean={layoutOptions && layoutOptions['a']?.withoutLean}
			noStyles={layoutOptions && layoutOptions['a']?.withoutStyle}
			effect={{ x: $effectX, y: $effectY }}
		>
			<slot name="a" />
		</HoverLeaning>
	</div>
	<div
		class={twMerge('b', layoutStyles['b'])}
		style={`${
			customLayout && customLayout['b']
				? `grid-column: ${customLayout['b']['columns']}; grid-row: ${customLayout['b']['rows']}`
				: ''
		}`}
	>
		<HoverLeaning
			noLean={layoutOptions && layoutOptions['b']?.withoutLean}
			noStyles={layoutOptions && layoutOptions['b']?.withoutStyle}
			effect={{ x: $effectX, y: $effectY }}
		>
			<slot name="b" />
		</HoverLeaning>
	</div>
	<div
		class={twMerge('c', layoutStyles['c'])}
		style={`${
			customLayout && customLayout['c']
				? `grid-column: ${customLayout['c']['columns']}; grid-row: ${customLayout['c']['rows']}`
				: ''
		}`}
	>
		<HoverLeaning
			noLean={layoutOptions && layoutOptions['c']?.withoutLean}
			noStyles={layoutOptions && layoutOptions['c']?.withoutStyle}
			effect={{ x: $effectX, y: $effectY }}
		>
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
