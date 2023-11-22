<script lang="ts" context="module">
	import type { Tag } from '@prisma/client';

	export type CardAlternativeProps = {
		title: string;
		description?: string;
		img?: string | null;
		icon?: string | null;
		createdAt?: Date;
		stars?: number;
		views?: number;
		tags?: Tag[];
	};
</script>

<script lang="ts">
	import { transformDate } from '~/lib/utils/date';
	import IconButton from '~components/buttons/IconButton.svelte';
	import Star from '~components/globals/Star.svelte';
	import { onImageLoad } from '~use/onImageLoad';

	let isIconFallback = false;

	export let data: CardAlternativeProps;
	export let navigationLink: string | null = null;
</script>

<div class="px-1 w-full max-w-[300px] aspect-[4/5]">
	<div class="flex flex-col h-full rounded-md shadow-lg bg-light_whiter">
		<div
			class=" relative w-full aspect-video before:content-[''] before:w-full before:h-1 before:bg-light_secondary before:left-0 before:bottom-0 before:translate-y-1/2 before:absolute before:z-[2]
					"
		>
			<div>
				{#if data.stars !== undefined}
					<div
						class="absolute flex items-center gap-1 px-2 py-1 rounded-lg right-1 top-1 bg-light_white"
					>
						<span class="text-light_text_black text-body2">
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
							src={data.icon ?? '/imgs/content_imgs/poly.png'}
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
			<div class="relative w-full overflow-hidden group effect">
				<IconButton
					icon="ic:round-arrow-right"
					containerClasses="absolute -translate-x-1/2 translate-y-1/2 left-1/2 
					bottom-1/2 border-2 border-solid border-light_text_black_60 bg-transparent 
					backdrop-blur-sm hover:backdrop-blur-xl hover:bg-transparent 
					pointer-events-none opacity-0 group-hover:opacity-100 duration-150"
				/>
				<a href={navigationLink || '#'} class="w-full">
					<img
						src={data.img || '/imgs/content_imgs/poly.png'}
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
						class="w-full overflow-hidden font-semibold text-center text-h6 overflow-ellipsis whitespace-nowrap"
					>
						{data.title}
					</h3>
				</abbr>
				{#if data.createdAt}
					<span class="block text-center text-body2 text-light_text_black_80"
						>{transformDate(data.createdAt, { time: true })}</span
					>
				{/if}
				{#if data.description}
					<div
						class="mt-2 text-center break-all line-clamp-3 text-body2 text-over"
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
								class="px-2 py-1 text-xs text-center rounded-sm shadow-sm bg-light_grey text-light_text_black_60"
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
