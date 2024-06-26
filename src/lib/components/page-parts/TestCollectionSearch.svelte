<script lang="ts">
	import CardGridContainer from '~components/containers/card/CardGridContainer.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import OrderButton from '~components/inputs/OrderButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import type { TestFullType } from '~/Prisma';
	import CardAlternative from '~components/containers/card/CardAlternative.svelte';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers';
	import type { Tag } from '@prisma/client';
	import CardSkeleton from '~components/containers/card/CardSkeleton.svelte';

	const modalTabsGenerator = getContext('modalTabsGenerator');

	let addIntersection: CreateObserverReturn['addIntersection'];

	let searchQuery: string = '';
	let isFetchingNewTests: boolean = false;
	let isRegettingAllTests: boolean = false;
	let isInitialFetch: boolean = true;

	let tests: Awaited<
		ReturnType<ReturnType<typeof trpc>['getUserTestsById']['query']>
	> = [];
	let orderRef: HTMLSelectElement | null = null;

	export function filterTests(ids: string[]) {
		tests = tests.filter((test) => !ids.includes(test.id));
	}

	async function getTests(
		shouldReset: boolean = false,
		orderBy: 'stars' | 'date' = 'date'
	) {
		if (tests === undefined) return;

		isFetchingNewTests = true;
		if (shouldReset) isRegettingAllTests = true;

		const data = await trpc($page).getUserTestsById.query({
			// @ts-ignore
			id: $page.data.session?.user?.id,
			limit: 4,
			cursor: shouldReset ? undefined : tests[tests.length - 1].id,
			searchQuery: searchQuery,
			order: orderBy
		});

		isFetchingNewTests = false;
		isInitialFetch = false;

		// Cleanup
		if (shouldReset) {
			isRegettingAllTests = false;
			tests = [];
		}

		tests = [...tests, ...data];
	}

	function getOrderType(value: string | undefined) {
		switch (value) {
			case 'date': {
				return 'date';
			}
			case 'stars': {
				return 'stars';
			}
			default: {
				return 'date';
			}
		}
	}

	function onOrderByChange() {
		const orderBy = getOrderType(orderRef?.value);
		getTests(true, orderBy);
	}

	// let searchRequests: Array<Promise<string> | string> = [];

	async function searchForResults(value: string) {
		// const searchQueryPromise = delayResults(500, value);
		// searchRequests.unshift(searchQueryPromise);
		// const searchQueryResult = await searchQueryPromise;

		// if (searchRequests.length === 1) {
		// searchQuery = searchQueryResult;
		searchQuery = value;
		const orderBy = getOrderType(orderRef?.value);
		getTests(true, orderBy);
		// }
		// searchRequests.pop();
	}

	function getTestTags(indexOfTest: number) {
		const tags = tests[indexOfTest].tags.filter(({ tag }) => tag !== null);
		return tags.map(({ tag }) => {
			return {
				id: tag?.id,
				name: tag?.name,
				slug: tag?.slug,
				color: tag?.color,
				createdAt: tag?.createdAt,
				updatedAt: tag?.updatedAt
			} as Tag;
		});
	}

	onMount(async () => {
		// Observing last element to fetch more tests, then unobserving it
		// observer = new IntersectionObserver(
		// 	(entries) => {
		// 		entries.forEach(async (entry) => {
		// 			if (entry.isIntersecting) {
		// 				getTests(false, getOrderType(orderRef?.value));

		// 				observer.unobserve(entry.target);
		// 			}
		// 		});
		// 	},
		// 	{
		// 		threshold: 0.5
		// 	}
		// );
		const { addIntersection: addIntersectionTemp, observer } = createObserver({
			callback: (entry) => {
				if (entry.isIntersecting) {
					getTests(false, getOrderType(orderRef?.value));

					observer.unobserve(entry.target);
				}
			}
		});

		addIntersection = addIntersectionTemp;
	});

	const TypesafeTabs = (test: TestFullType) => {
		return (modalTabsGenerator as Function)(test);
	};

	$: if (orderRef?.value) {
		// When odering changes refetch, also fetches initial data
		onOrderByChange();
	}
</script>

<div
	class="flex flex-col items-center justify-center gap-2 xs:px-12 sm:flex-row"
>
	<SearchBar searchFunction={searchForResults} />
	<OrderButton
		bind:selectRef={orderRef}
		options={[
			{
				value: 'Date'
			},
			{
				value: 'Stars'
			}
		]}
	/>
</div>
<Space />
<div class="@container max-w-[1400px]">
	{#if isInitialFetch}
		<CardGridContainer>
			<CardSkeleton />
			<CardSkeleton />
			<CardSkeleton />
		</CardGridContainer>
	{:else if tests.length === 0}
		<div class="flex flex-col items-center gap-1">
			<iconify-icon
				icon="solar:mask-sad-linear"
				class="text-8xl text-light_text_black_20 dark:text-dark_text_white_20"
			/>
			<p class="text-light_text_black_40 dark:text-dark_text_white_40">
				No tests here, go fix that!
			</p>
			<a
				href="/dashboard/test-creator"
				class="text-xs btn dark:bg-dark_light_grey dark:text-dark_text_white_80 dark:border-dark_light_grey dark:hover:bg-dark_grey dark:hover:border-dark_grey"
				>Create your first test!</a
			>
		</div>
	{:else}
		<CardGridContainer>
			{#each tests as test, index}
				<div use:addIntersection={{ shouldActive: index === tests.length - 1 }}>
					<CardAlternative
						type={test.type}
						class={`${isRegettingAllTests ? 'opacity-50' : ''}`}
						navigationLink={`/tests/${test.id}`}
						data={{
							id: test.id,
							title: test.title,
							stars: test._count.stars,
							createdAt: test.createdAt,
							description: test.description,
							icon: test.owner.image,
							img: test.imageUrl,
							tags: getTestTags(index),
							views: test.views,
							published: test.published,
							user:
								test.owner.name && test.owner.slug
									? {
											name: test.owner.name,
											slug: test.owner.slug
									  }
									: undefined,
							options: TypesafeTabs(test)
						}}
					/>
				</div>
			{/each}
		</CardGridContainer>
	{/if}
</div>
<Space />
