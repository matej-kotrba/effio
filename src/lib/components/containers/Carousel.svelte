<script lang="ts" context="module">
	import type { CardAlternativeProps } from '~components/containers/card/CardAlternative.svelte';

	export type IdCardAlternativeProps = CardAlternativeProps & { id: string };

	export type CarouselItemInput =
		| IdCardAlternativeProps[]
		| Promise<IdCardAlternativeProps[]>;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import IconButton from '~components/buttons/IconButton.svelte';
	import SkeletonLine from '~components/informatic/SkeletonLine.svelte';
	import CardAlternative from './card/CardAlternative.svelte';

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
	): data is IdCardAlternativeProps[] {
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
			//TODO: Changed here last countOfItems from countOfItems + 1, if it wont work, change it back
			if (
				oldValueNumberPercent <=
				-(100 / countOfItems) * resolvedData.length +
					(100 / countOfItems) * countOfItems // <--- This is the last item
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

<section class="grid w-full h-full grid__layout">
	<div class="flex gap-2">
		<IconButton
			icon="ic:round-arrow-left"
			containerClasses="ml-auto dropdown-top dropdown-left border-2 border-solid border-light_text_black_60 bg-light_white dark:bg-dark_grey"
			tooltipClasses="bg-light_whiter dark:bg-dark_light_grey rounded-md"
			onClick={scrollLeft}
		/>
		<IconButton
			icon="ic:round-arrow-right"
			containerClasses="dropdown-top dropdown-left border-2 border-solid border-light_text_black_60 bg-light_white dark:bg-dark_grey"
			tooltipClasses="bg-light_whiter dark:bg-dark_light_grey rounded-md"
			onClick={scrollRight}
		/>
	</div>
	<div class="w-full h-full overflow-hidden">
		{#await data}
			<div class="@container h-full">
				<div class="flex w-full py-1 scroller flex-nowrap">
					{#each Array(countOfItems).fill('') as _}
						<div
							class="min-w-[calc(100%/var(--items-count))] h-full relative aspect-[4/5]"
						>
							<div class="px-1 w-full max-w-[300px] h-full aspect-[4/5]">
								<div
									class="h-full rounded-md shadow-lg bg-light_whiter dark:bg-dark_light_grey"
								>
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
			</div>
		{:then awaitedData}
			<div class="@container h-full">
				<div
					bind:this={scrollerDiv}
					class="flex w-full h-full py-1 scroller flex-nowrap"
					style="--translate-x: 0%;"
				>
					{#each awaitedData as item}
						<div
							class="min-w-[calc(100%/var(--items-count))] relative aspect-[4/5]"
						>
							<CardAlternative
								class="mx-auto"
								navigationLink={'/tests/' + item.id}
								data={{
									...item
								}}
							/>
						</div>
					{/each}
				</div>
			</div>
		{/await}
	</div>
</section>

<style>
	.grid__layout {
		grid-template-rows: auto 1fr;
	}
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
	@container (min-width: 22rem) and (width < 30rem) {
		.scroller {
			--items-count: 2;
		}
	}
	@container (width < 22rem) {
		.scroller {
			--items-count: 1;
		}
	}
</style>
