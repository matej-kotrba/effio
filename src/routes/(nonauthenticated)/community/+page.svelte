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
	import Carousel from '~components/containers/Carousel.svelte';

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

	onMount(async () => {
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

<div>
	<h3 class="italic font-bold text-h3">Recently popular</h3>
	<div class="max-h-[24rem] h-[24rem] relative isolate">
		<Carousel
			data={[
				{
					title: 'Test 1',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, nec ultricies nisl nisl nec nisl. Sed euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, nec ultricies nisl nisl nec nisl.'
				},
				{
					title: 'Test 2',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				},
				{
					title: 'Test 3',
					description: 'Lorem ipsum dolor sit amet.'
				},
				{
					title: 'Test 4',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				},
				{
					title: 'Test 5',
					description:
						'Lorem ipsum dolor sit amet. asd asd asd xcyxc qusd jad uc hyxj haiusd hajx hxuch yiuch asjdh akusdhuaks dhkuashdasudha udhaus dajkdh'
				},
				{
					title: 'Test 1',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, nec ultricies nisl nisl nec nisl. Sed euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, nec ultricies nisl nisl nec nisl.'
				},
				{
					title: 'Test 2',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				},
				{
					title: 'Test 3',
					description: 'Lorem ipsum dolor sit amet.'
				},
				{
					title: 'Test 4',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				},
				{
					title: 'Test 5',
					description:
						'Lorem ipsum dolor sit amet. asd asd asd xcyxc qusd jad uc hyxj haiusd hajx hxuch yiuch asjdh akusdhuaks dhkuashdasudha udhaus dajkdh'
				}
			]}
		/>
		<Map
			class="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 -z-[8]"
		/>
		<svg
			viewBox="0 0 1000 1000"
			xmlns="http://www.w3.org/2000/svg"
			class="absolute bottom-0 h-[150%] left-1/2 -z-10 top-1/2 -translate-y-1/2 -translate-x-[40%]"
			><defs
				><clipPath id="a"
					><path
						fill="currentColor"
						d="M793.5 612.5Q769 725 676 848t-229.5 52Q310 829 220 732t-97.5-234.5Q115 360 229 294t233-158.5Q581 43 725.5 116T844 344.5q-26 155.5-50.5 268Z"
					/></clipPath
				></defs
			><g clip-path="url(#a)"
				><path
					fill="#ccc2ff"
					d="M793.5 612.5Q769 725 676 848t-229.5 52Q310 829 220 732t-97.5-234.5Q115 360 229 294t233-158.5Q581 43 725.5 116T844 344.5q-26 155.5-50.5 268Z"
				/></g
			></svg
		>
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
