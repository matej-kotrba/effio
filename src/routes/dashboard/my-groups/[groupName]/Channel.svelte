<script lang="ts">
	import { browser } from '$app/environment';
	import { afterUpdate, onMount } from 'svelte';
	import {
		groupSubcategoryIcons,
		type GROUP_SUBCATEGORY_TYPES
	} from '~helpers/constants';
	import { onImageLoad } from '~use/onImageLoad';
	import { getContrastRatio, type ColorRGB } from '~utils/color';
	import * as DropdownMenu from '~components/ui/dropdown-menu/index';

	export let name: string;
	export let type: keyof typeof GROUP_SUBCATEGORY_TYPES;
	export let imageUrl: string | null;
	export let redirectLink: string;
	export let isOwner = false;

	let isImageFallback = imageUrl === null;

	let colorElement: HTMLDivElement;

	$: word = name.split(' ').map((word) => {
		return word[0];
	});
	$: displayedWord =
		word.length === 1
			? name.slice(0, 3)
			: word.length > 5
			? word.slice(0, 5).join('')
			: word.join('');
	$: color =
		displayedWord.split('').reduce((count, letter) => {
			return letter.charCodeAt(0) * 5 + count;
		}, 0) % 360;
	// $: textColor =

	function hexToRgb(hex: string): [number, number, number] | null {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? [
					parseInt(result[1], 16),
					parseInt(result[2], 16),
					parseInt(result[3], 16)
			  ]
			: null;
	}

	function getCorrectColorToDisplay() {
		const style = getComputedStyle(document.body);
		const black = style.getPropertyValue('--light-text-black');
		const white = style.getPropertyValue('--dark-text-white');
		const element = getComputedStyle(colorElement);
		const convertedColor = element.backgroundColor
			.substring(4, element.backgroundColor.length - 1)
			.split(', ')
			.map(Number) as ColorRGB;
		const hexBlack = hexToRgb(black) || [0, 0, 0];
		const hexWhite = hexToRgb(white) || [255, 255, 255];
		const contrastBlack = getContrastRatio(convertedColor, hexBlack);
		const contrastWhite = getContrastRatio(convertedColor, hexWhite);

		if (contrastBlack > contrastWhite) {
			colorElement.style.color = black;
		} else {
			colorElement.style.color = white;
		}
	}

	onMount(() => {
		if (imageUrl === null || isImageFallback === true) {
			getCorrectColorToDisplay();
		}
	});

	$: {
		if (browser) {
			if (colorElement && (imageUrl === null || isImageFallback === true)) {
				getCorrectColorToDisplay();
			}
		}
	}
</script>

<div class="relative">
	<div class="absolute z-10 left-1 top-1">
		<iconify-icon
			class="grid p-2 border rounded-full bg-light_whiter dark:bg-dark_terciary place-content-center border-light_text_black_20 dark:border-dark_text_white_20"
			icon={groupSubcategoryIcons[type]}
		/>
	</div>
	{#if isOwner}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="absolute z-10 grid right-1 top-1 place-content-center"
			>
				<iconify-icon icon="tabler:dots" class="text-xl" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label>Channel options</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<slot />
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
	<a
		href={redirectLink}
		class="grid place-content-center relative aspect-[3/2] px-4 border bg-light_grey hover:bg-light_grey_dark duration-150 border-light_text_black_10 dark:border-dark_text_white_10 rounded-md shadow-sm dark:bg-dark_grey dark:hover:bg-dark_light_grey"
	>
		<div
			class="relative object-cover mx-auto overflow-hidden rounded-lg w-fit aspect-square"
		>
			{#if isImageFallback || imageUrl === null}
				<div
					bind:this={colorElement}
					class="fallback w-[70px] h-full grid place-content-center font-semibold"
					style={`--color: ${color};`}
				>
					{displayedWord}
				</div>
			{:else}
				<img
					src={imageUrl}
					role="presentation"
					alt=""
					width="70"
					use:onImageLoad
					on:imageerror={(e) => {
						isImageFallback = true;
					}}
				/>
			{/if}
		</div>
		<p class="text-center line-clamp-3 overflow-x-clip hyphens-auto">
			{name}
		</p>
	</a>
</div>

<style>
	.fallback {
		background-color: hsl(var(--color), 100%, 50%);
	}
</style>
