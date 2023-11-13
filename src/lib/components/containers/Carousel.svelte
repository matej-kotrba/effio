<script lang="ts" context="module">
	import type { CardAlternativeProps } from '~components/containers/card/CardAlternative.svelte';

	export type CarouselItemInput =
		| CardAlternativeProps[]
		| Promise<CardAlternativeProps[]>;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { transformDate } from '~/lib/utils/date';
	import IconButton from '~components/buttons/IconButton.svelte';
	import Star from '~components/globals/Star.svelte';
	import SkeletonLine from '~components/informatic/SkeletonLine.svelte';

	export let data: CarouselItemInput;
	let resolvedData: CardAlternativeProps[] | undefined = undefined;

	if (!isDataResolved(data)) {
		data.then((resolvedArray) => {
			resolvedData = resolvedArray;
		});
	}

	let scrollerDiv: HTMLDivElement;

	let countOfItems = 6;

	function isDataResolved(
		data: CarouselItemInput
	): data is CardAlternativeProps[] {
		// @ts-expect-error
		return data.then === undefined;
	}

	function scrollLeft() {
		if (resolvedData === undefined) return;
		const oldValue = scrollerDiv.style.getPropertyValue('--translate-x');
		if (oldValue.indexOf('%') === -1) return;
		try {
			let oldValueNumberPercent = +oldValue.replace('%', '');
			if (oldValueNumberPercent >= 0) return;
			oldValueNumberPercent = oldValueNumberPercent + 100 / countOfItems;
			scrollerDiv.style.setProperty(
				'--translate-x',
				`${oldValueNumberPercent}%`
			);
		} catch (e) {}
	}
	function scrollRight() {
		if (resolvedData === undefined) return;
		const oldValue = scrollerDiv.style.getPropertyValue('--translate-x');
		if (oldValue.indexOf('%') === -1) return;
		try {
			let oldValueNumberPercent = +oldValue.replace('%', '');
			if (
				oldValueNumberPercent <=
				-(100 / countOfItems) * resolvedData.length +
					(100 / countOfItems) * (countOfItems + 1)
			)
				return;
			oldValueNumberPercent = oldValueNumberPercent - 100 / countOfItems;
			scrollerDiv.style.setProperty(
				'--translate-x',
				`${oldValueNumberPercent}%`
			);
		} catch (e) {}
	}

	function onResize() {
		if (scrollerDiv === undefined) return;
		const computedStyle = getComputedStyle(scrollerDiv);

		const oldValue = computedStyle.getPropertyValue('--translate-x');
		const cssItemsCount = Number(
			computedStyle.getPropertyValue('--items-count')
		);
		let oldValueNumberPercent = +oldValue.replace('%', '');
		if (isNaN(cssItemsCount)) return;
		if (oldValueNumberPercent === undefined || isNaN(oldValueNumberPercent)) {
			return;
		}
		if (cssItemsCount === countOfItems) return;
		scrollerDiv.style.setProperty(
			'--translate-x',
			`${
				(100 / cssItemsCount) * (oldValueNumberPercent / (100 / countOfItems))
			}%`
		);
		countOfItems = cssItemsCount;
	}

	onMount(() => {
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	});

	$: onResize(), scrollerDiv;
</script>

<section class="w-full">
	<div class="flex gap-2">
		<IconButton
			icon="ic:round-arrow-left"
			containerClasses="ml-auto dropdown-top dropdown-left border-2 border-solid border-light_text_black_60 bg-light_white"
			tooltipClasses="bg-light_whiter rounded-md"
			onClick={scrollLeft}
		/>
		<IconButton
			icon="ic:round-arrow-right"
			containerClasses="dropdown-top dropdown-left border-2 border-solid border-light_text_black_60 bg-light_white"
			tooltipClasses="bg-light_whiter rounded-md"
			onClick={scrollRight}
		/>
	</div>
	<div class="w-full overflow-hidden">
		{#await data}
			<div class="flex w-full py-1 scroller flex-nowrap">
				{#each Array(countOfItems).fill('') as _}
					<div
						class="min-w-[calc(100%/var(--items-count))] relative aspect-[4/5]"
					>
						<div class="px-1 w-full max-w-[300px] aspect-[4/5]">
							<div class="h-full rounded-md shadow-lg bg-light_whiter">
								<div class="relative w-full aspect-video">
									<SkeletonLine class="w-full h-full aspect-video" />
								</div>
								<SkeletonLine class="w-[80%] mt-2" />
								<SkeletonLine class="w-[50%] mt-4 h-4" />
								<SkeletonLine class="w-[50%] mt-1 h-4" />
								<SkeletonLine class="w-[50%] mt-1 h-4" />
							</div>
						</div>
					</div>
				{/each}
				<span class="loading loading-infinity loading-lg" />
			</div>
		{:then awaitedData}
			<div class="@container">
				<div
					bind:this={scrollerDiv}
					class="flex w-full py-1 scroller flex-nowrap"
					style="--translate-x: 0%;"
				>
					{#each awaitedData as item}
						<div
							class="min-w-[calc(100%/var(--items-count))] relative aspect-[4/5]"
						>
							<div class="px-1 w-full max-w-[300px] aspect-[4/5]">
								<div class="h-full rounded-md shadow-lg bg-light_whiter">
									<div
										class="relative w-full aspect-video before:content-[''] before:w-full before:h-1 before:bg-light_secondary before:left-0 before:bottom-0 before:translate-y-1/2 before:absolute
					"
									>
										<div>
											{#if item.stars !== undefined}
												<div
													class="absolute flex items-center gap-1 px-2 py-1 rounded-lg right-1 top-1 bg-light_white"
												>
													<span class="text-light_text_black text-body2">
														{item.stars}
													</span>
													<Star />
												</div>
											{/if}
											<img
												src={item.icon ?? '/imgs/content_imgs/liska.avif'}
												alt="User Icon"
												class="absolute object-cover w-12 -translate-x-1/2 -translate-y-1/2 border-4 border-solid rounded-full aspect-square top-full left-1/2 border-light_secondary"
											/>
										</div>
										<img
											src={'/imgs/content_imgs/liska.avif'}
											alt={item.title}
											class="object-cover w-full h-full rounded-t-md"
										/>
									</div>
									<div class="p-2 mt-3">
										<abbr title={item.title} class="no-underline">
											<h3
												class="w-full overflow-hidden font-semibold text-center text-h6 overflow-ellipsis whitespace-nowrap"
											>
												{item.title}
											</h3>
										</abbr>
										{#if item.createdAt}
											<span
												class="block text-center text-body2 text-light_text_black_80"
												>{transformDate(item.createdAt, { time: true })}</span
											>
										{/if}
										{#if item.description}
											<div
												class="mt-2 text-center break-all line-clamp-3 text-body2 text-over"
											>
												{item.description}
											</div>
										{/if}
									</div>
									<!-- {#if item.description}
				<p>{item.description}</p>
				{/if} -->
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/await}
	</div>
</section>

<style>
	.scroller {
		--items-count: 6;
		transform: translateX(var(--translate-x));
		transition: transform 0.3s ease-in-out;
	}

	@container (min-width: 80rem) {
		.scroller {
			--items-count: 6;
		}
	}
	@container (min-width: 56rem) and (width < 80rem) {
		.scroller {
			--items-count: 5;
		}
	}
	@container (min-width: 44rem) and (width < 56rem) {
		.scroller {
			--items-count: 4;
		}
	}
	@container (min-width: 30rem) and (width < 44rem) {
		.scroller {
			--items-count: 3;
		}
	}
	@container (min-width: 16rem) and (width < 30rem) {
		.scroller {
			--items-count: 2;
		}
	}
	@container (width < 16rem) {
		.scroller {
			--items-count: 1;
		}
	}
</style>
