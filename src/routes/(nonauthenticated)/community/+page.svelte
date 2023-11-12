<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import CardMinimalized from '~components/containers/card/CardMinimalized.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import Space from '~components/separators/Space.svelte';
	import CardMinimalizedSkeleton from '~components/containers/card/CardMinimalizedSkeleton.svelte';
	import { goto } from '$app/navigation';
	import TagContainer from '~components/containers/tag/TagContainer.svelte';
	import { onMount } from 'svelte';
	import type { Tag } from '@prisma/client';
	import type { TestFullType } from '~/Prisma.js';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers.js';
	import Map from '~/lib/svg/map.svelte';
	import Carousel, {
		type CarouselItem
	} from '~components/containers/Carousel.svelte';
	import toast from 'svelte-french-toast';

	export let data;

	const REQUEST_AMOUNT = 8;

	let isFetchingNewTests = true;

	let searchQuery: string = $page.url.searchParams.get('q') || '';

	let unusedTags: Tag[] = data.tags;
	let usedTags: Tag[] = [];

	let requestedTests: Awaited<
		ReturnType<ReturnType<typeof trpc>['getPopularTests']['query']>
	>['tests'] = [];

	// Updating url on input change
	function updateUrl(inputValue: string) {
		const paramsObj: {
			[index: string]: string;
		} = {};

		if (inputValue !== '') {
			paramsObj['q'] = inputValue;
		}

		const params = new URLSearchParams(paramsObj);
		goto(`?${params.toString()}`);
	}

	async function getPopularTests() {
		const fetchedData = await trpc($page).getPopularTests.query({
			take: REQUEST_AMOUNT,
			timePeriod: 'two-weeks'
		});

		if (fetchedData.success === true && fetchedData.tests !== undefined) {
			return fetchedData.tests.map((item) => {
				return {
					title: item.title,
					description: item.description,
					img: undefined,
					icon: item.owner.image,
					createdAt: item.createdAt
				} satisfies CarouselItem;
			});
		} else {
			toast.error(
				fetchedData.message || 'Unknown error has occured while fetching tests'
			);
			return [];
		}
	}

	// Fetching new data
	async function getTests(
		shouldReset: boolean = false,
		specificQuery: string | undefined = undefined
	) {
		if (requestedTests === undefined) return;
		if (shouldReset) {
			requestedTests = [];
		}

		isFetchingNewTests = true;

		// await new Promise((res) => setTimeout(res, 5000));
		let newData = await trpc($page).getPopularTests.query({
			take: REQUEST_AMOUNT,
			cursor: requestedTests[requestedTests.length - 1]?.id ?? undefined,
			tags: usedTags.length !== 0 ? usedTags.map((tag) => tag.name) : undefined,
			searchQuery: specificQuery ?? searchQuery ?? undefined
		});

		isFetchingNewTests = false;

		if (!newData.tests) return;

		requestedTests = [...requestedTests, ...newData.tests];
	}

	let addIntersectionUse: CreateObserverReturn['addIntersection'];

	onMount(() => {
		const { observer, addIntersection } = createObserver({
			callback: (entry, observer) => {
				if (entry.isIntersecting) {
					getTests();

					observer.unobserve(entry.target);
				}
			}
		});
		addIntersectionUse = addIntersection;
		// Get initial state of the tests (by search params if available)
		getTests(false, $page.url.searchParams.get('q') || undefined);

		return () => {
			observer.disconnect();
		};
	});

	async function changeToggleStatus(index: number, isActive: boolean) {
		if (isActive === false) {
			usedTags = usedTags.filter((tag) => tag.id !== unusedTags[index].id);
		}
		if (usedTags.includes(unusedTags[index])) return;
		usedTags = [...usedTags, unusedTags[index]];

		isFetchingNewTests = true;

		requestedTests = (
			await trpc($page).getPopularTests.query({
				tags: usedTags.map((tag) => tag.name)
			})
		).tests;

		isFetchingNewTests = false;
	}

	// Search for results on inpput change, wait 500ms befor sending request for optimization
	async function searchForResults(value: string) {
		searchQuery = value;
		updateUrl(value);
		await getTests(true);
	}

	function getTypesafeTags(tags: TestFullType['tags']) {
		return tags.map((item) => item.tag) as Tag[];
	}
</script>

<div class="relative">
	<div
		style={`--height-value: 120%;`}
		class="absolute left-0 w-full bg z-[0] h-[var(--height-value)] -translate-y-[calc(var(--height-value)/2-50%)] text-white cover-text"
	>
		<div class="inner-text">
			<h3
				class="relative italic font-bold text-h3 underline-effect after:bg-light_quaternary"
			>
				Recently popular
			</h3>
		</div>
	</div>
	<h3
		class="relative italic font-bold text-h3 underline-effect -z-[20] after:bg-light_primary"
	>
		Recently popular
	</h3>
	<div class="max-h-[24rem] h-[24rem] relative isolate">
		<Carousel data={getPopularTests()} />
	</div>
</div>

<!-- 
<div>
	<div
		class="flex flex-col justify-center mb-4 border-b-2 border-light_text_black"
	>
		<SearchBar searchFunction={searchForResults} initialValue={searchQuery} />
		<Space gap={10} />
		<h4>Filter by a tag</h4>
		<div class="flex flex-wrap gap-1">
			{#each unusedTags as tag, index}
				<TagContainer
					title={tag.name}
					color={tag.color}
					isActive={usedTags.some((tag) => tag.id === unusedTags[index].id)}
					on:activeToggle={(data) => changeToggleStatus(index, data.detail)}
				/>
			{/each}
		</div>
		<div class="flex flex-wrap gap-1">
			{#each usedTags as tag, index}
				<TagContainer
					title={tag.name}
					color={tag.color}
					isActive={usedTags.some((tag) => tag.id === unusedTags[index].id)}
					on:activeToggle={(data) => changeToggleStatus(index, data.detail)}
				/>
			{/each}
		</div>
		<Space gap={10} />
	</div>
	<div
		class="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
	>
		{#if requestedTests !== undefined}
			{#each requestedTests as test, index}
				{#if index === requestedTests.length - 1}
					<div use:addIntersectionUse={{ shouldActive: true }} class="w-full">
						<button
							type="button"
							on:click={() => {
								goto(`/tests/${test.id}`);
							}}
							class="w-full"
						>
							<CardMinimalized
								title={test.title}
								description={test.description}
								author={test.owner.name || 'Anonymous'}
								authorImg={test.owner.image}
								stars={test.stars}
								views={test.views}
								tags={getTypesafeTags(test.tags)}
							/>
						</button>
					</div>
				{:else}
					<button
						type="button"
						on:click={() => {
							goto(`/tests/${test.id}`);
						}}
					>
						<CardMinimalized
							title={test.title}
							description={test.description}
							author={test.owner.name || 'Anonymous'}
							authorImg={test.owner.image}
							stars={test.stars}
							views={test.views}
							tags={getTypesafeTags(test.tags)}
						/>
					</button>
				{/if}
			{/each}
		{/if}
		{#if isFetchingNewTests}
			{#each Array(REQUEST_AMOUNT) as _}
				<CardMinimalizedSkeleton />
			{/each}
		{/if}
	</div>
</div> -->
<style>
	.underline-effect::after {
		content: '';
		width: 100%;
		height: 4px;
		position: absolute;
		left: 0;
		bottom: 6px;
		z-index: -1;
		border-radius: 50px;
		animation: underline_appear 0.8s ease-out forwards;
		transform-origin: left;
	}

	@keyframes underline_appear {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	.inner-text {
		position: absolute;
		left: 0;
		top: calc(var(--height-value) / 2 - 50%);
		width: 100%;
		height: 100%;
		z-index: 10;
	}
	.cover-text::after {
		@apply italic font-bold text-h3;
		content: attr(data-cover-text);
		position: absolute;
		left: 0;
		color: white;
		width: 100%;
		height: 100%;
	}
	.bg {
		min-height: 100px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Cdefs%3E%3CradialGradient id='a' cx='396' cy='281' r='514' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23806CF7'/%3E%3Cstop offset='1' stop-color='%236433F0'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='400' y1='148' x2='400' y2='333'%3E%3Cstop offset='0' stop-color='%23DBDFFD' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23DBDFFD' stop-opacity='0.5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='400'/%3E%3Cg fill-opacity='0.39'%3E%3Ccircle fill='url(%23b)' cx='267.5' cy='61' r='300'/%3E%3Ccircle fill='url(%23b)' cx='532.5' cy='61' r='300'/%3E%3Ccircle fill='url(%23b)' cx='400' cy='30' r='300'/%3E%3C/g%3E%3C/svg%3E");
		background-size: cover;
		background-position: bottom;
		background-repeat: no-repeat;
		mask-image: url('/masks/community/blob.png');
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
	}
</style>
