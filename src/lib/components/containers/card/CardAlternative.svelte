<script lang="ts" context="module">
	import type { Tag, TestType } from '@prisma/client';

	export type CardAlternativeProps = {
		title: string;
		description?: string;
		img?: string | null;
		icon?: string | null;
		createdAt?: Date;
		stars?: number;
		views?: number;
		tags?: Tag[];
		options?: {
			iconClass?: string;
			text: string;
			action: (e: MouseEvent) => void;
		}[];
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { transformDate } from '~/lib/utils/date';
	import IconButton from '~components/buttons/IconButton.svelte';
	import DropdownSelect from '~components/collapsibles/DropdownSelect.svelte';
	import Star from '~components/globals/Star.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import { onImageLoad } from '~use/onImageLoad';

	let isIconFallback = false;
	let isImageFallback = false;

	export let data: CardAlternativeProps;
	export let type: TestType = 'REGULAR';
	export let navigationLink: string | null = null;

	let classes = '';
	export { classes as class };
</script>

<div
	class={twMerge('px-1 w-full max-w-[260px] aspect-[4/5] @container', classes)}
>
	<div
		class="flex flex-col h-full rounded-md shadow-lg bg-light_whiter dark:bg-dark_light_grey"
	>
		<div
			class="relative w-full aspect-video before:content-[''] before:w-full before:h-1 before:bg-light_secondary before:left-0 before:bottom-0 before:translate-y-1/2 before:absolute before:z-[2]
					"
		>
			<div>
				{#if data.options !== undefined && data.options.length > 0}
					<div
						class="absolute flex items-center z-[2000] gap-1 px-2 py-1 rounded-lg left-1 top-1 bg-light_white dark:bg-dark_grey"
					>
						<DropdownSelect dropdownTabs={data.options}>
							<iconify-icon
								icon="fluent:settings-24-filled"
								class={twMerge(
									'text-2xl duration-100 text-light_text_black dark:text-dark_text_white',
									classes
								)}
							/>
						</DropdownSelect>
					</div>
				{/if}
				{#if data.stars !== undefined}
					<div
						class="absolute flex items-center z-[2] gap-1 px-2 py-1 rounded-lg right-1 top-1 bg-light_white dark:bg-dark_grey"
					>
						<span
							class="text-light_text_black dark:text-dark_text_white text-body2"
						>
							{data.stars}
						</span>
						<Star />
					</div>
				{/if}
				<div
					class="absolute w-12 text-white -translate-x-1/2 -translate-y-1/2 border-4 border-solid rounded-full aspect-square top-full left-1/2 bg-light_secondary border-light_secondary z-[2]"
				>
					{#if isIconFallback === false}
						<img
							src={data.icon}
							alt=""
							loading="lazy"
							use:onImageLoad
							on:imageerror={(e) => {
								isIconFallback = true;
								// e.target.src = '/imgs/svgs/user-circle.svg';
							}}
							class="object-cover w-full h-full rounded-full"
						/>
					{:else}
						<div
							class="absolute grid -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 place-content-center"
						>
							<iconify-icon icon="fa:user-circle" class="text-4xl" />
						</div>
					{/if}
				</div>
			</div>
			{#if type === 'PROGRAMMING'}
				<div
					data-tip="Programming test"
					class="absolute bottom-0 left-0 z-10 grid pt-4 pb-2 pl-2 pr-4 bg-blue-500 place-content-center special-border-radius tooltip"
				>
					<iconify-icon icon="fa-solid:tools" />
				</div>
			{/if}
			<div
				class={`relative w-full overflow-hidden group effect ${
					type === 'PROGRAMMING'
						? 'border-2 border-solid border-blue-500 rounded-t-md'
						: ''
				}`}
			>
				<IconButton
					icon="ic:round-arrow-right"
					containerClasses="absolute -translate-x-1/2 translate-y-1/2 left-1/2 
					bottom-1/2 border-2 border-solid border-light_text_black_60 bg-transparent 
					backdrop-blur-sm hover:backdrop-blur-xl hover:bg-transparent 
					pointer-events-none opacity-0 group-hover:opacity-100 duration-150"
				/>
				<a href={navigationLink || '#'} class={`w-full h-full relative`}>
					<img
						use:onImageLoad
						src={isImageFallback
							? $applicationStates['darkMode']['isDarkMode']
								? '/imgs/content_imgs/poly_dark.png'
								: '/imgs/content_imgs/poly.png'
							: data.img
							? data.img
							: $applicationStates['darkMode']['isDarkMode']
							? '/imgs/content_imgs/poly_dark.png'
							: '/imgs/content_imgs/poly.png'}
						on:imageerror={(e) => {
							isImageFallback = true;
						}}
						alt={data.title}
						class="object-cover aspect-[5/3] w-full duration-150 origin-bottom rounded-t-md"
					/>
				</a>
			</div>
		</div>
		<div class="flex flex-col justify-between grow-[1]">
			<div class="p-2 mt-3">
				<abbr title={data.title} class="no-underline">
					<h3
						class="w-full overflow-hidden font-semibold text-center text-body1 @[14rem]:text-h6 overflow-ellipsis whitespace-nowrap"
					>
						{data.title}
					</h3>
				</abbr>
				{#if data.createdAt}
					<span
						class="block text-center text-body3 @[14rem]:text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
						>{transformDate(data.createdAt, { time: true })}</span
					>
				{/if}
				{#if data.description}
					<div
						class="mt-1 text-center break-all line-clamp-2 @[14rem]:line-clamp-3 text-body2 text-over"
					>
						{data.description}
					</div>
				{/if}
			</div>
			<div>
				{#if data.tags}
					<div
						class="flex flex-wrap justify-center gap-1 p-1 overflow-x-auto max-h-10 scroll-snap"
					>
						{#each data.tags as tag}
							<span
								class="px-2 py-1 text-xs text-center rounded-sm shadow-sm bg-light_grey text-light_text_black_60 dark:bg-dark_grey dark:text-dark_text_white"
								>{tag.name}</span
							>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.special-border-radius {
		border-radius: 0% 100% 61% 39% / 100% 100% 0% 0%;
	}

	.scroll-snap {
		scroll-snap-type: y mandatory;
	}

	.effect::after {
		content: '';
		width: 12px;
		height: 300%;
		rotate: 45deg;
		left: -100%;
		top: -100%;
		transform: translateY(-50%) translateX(-0%);
		background-color: white;
		filter: blur(8px);
		position: absolute;
		pointer-events: none;
	}

	:global(.dark) .effect::after {
		background-color: var(--dark-text-white-60);
	}

	.effect:hover::after {
		animation: slide 0.5s linear forwards;
	}
	@keyframes slide {
		from {
			left: -100%;
			top: -100%;
		}
		to {
			left: 100%;
			top: 100%;
		}
	}
</style>
