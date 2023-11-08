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
		<!-- <div class="flex flex-wrap gap-1">
			{#each usedTags as tag, index}
				<TagContainer
					title={tag.name}
					color={tag.color}
					isActive={usedTags.some((tag) => tag.id === unusedTags[index].id)}
					on:activeToggle={(data) => changeToggleStatus(index, data.detail)}
				/>
			{/each}
		</div> -->
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
</div>
