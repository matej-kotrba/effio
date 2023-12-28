<script lang="ts">
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import OrderButton from '~components/inputs/OrderButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { delayResults } from '~helpers/delay';
	import DropdownSelect from '~components/collapsibles/DropdownSelect.svelte';
	import { getContext } from 'svelte';
	import type { TestFullType } from '~/Prisma';
	import CardAlternative from '~components/containers/card/CardAlternative.svelte';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers';
	import type { Tag } from '@prisma/client';

	const modalTabsGenerator = getContext('modalTabsGenerator');

	let addIntersection: CreateObserverReturn['addIntersection'];

	let searchQuery: string = '';
	let isFetchingNewTests: boolean = false;
	let isRegettingAllTests: boolean = false;

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

<div class="flex items-center justify-center gap-2 px-12">
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
<div class="@container">
	{#if tests.length === 0}
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
		<!-- @7xl:grid-cols-5 @5xl:grid-cols-4 @2xl:grid-cols-3 @md:grid-cols-2 grid-cols-1 -->
		<div class="grid gap-2 gap-y-4 grid__layout">
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
							options: TypesafeTabs(test)
						}}
					/>
				</div>
				<!-- <div
					class="relative rounded-md shadow-md aspect-[3/2] bg-light_whiter hover:bg-light_quaternary dark:bg-dark_light_grey dark:hover:bg-dark_terciary duration-100"
				>
					{#if test === tests[tests.length - 1]}
						<a class="absolute inset-3">
							<img
								src="/imgs/content_imgs/liska.avif"
								alt="Question"
								class="object-cover w-full h-full rounded-md"
							/>
						</a>
						<div class="relative z-[2]" use:addIntersection>
							<div class="flex items-center justify-between w-full p-4">
								<div class="flex items-center">
									<iconify-icon
										icon="ic:round-star-outline"
										class="text-3xl text-white duration-100"
									/>
									<span class="text-sm text-white">{test.stars}</span>
								</div>
								<DropdownSelect dropdownTabs={TypesafeTabs(test)}>
									<iconify-icon
										icon="fluent:settings-24-filled"
										class="text-2xl text-white"
									/>
								</DropdownSelect>
							</div>
						</div>
						<div
							class="absolute bottom-0 left-0 w-full px-4 py-1 text-center dark:bg-dark_terciary bg-light_quaternary rounded-b-md text-semiBody1"
						>
							<abbr title={test.title} class="no-underline"
								><h5 class="overflow-hidden text-ellipsis whitespace-nowrap">
									{test.title}
								</h5></abbr
							>
						</div>
					{:else}
						<a class="absolute inset-3">
							<img
								src="/imgs/content_imgs/liska.avif"
								alt="Question"
								class="object-cover w-full h-full rounded-md"
							/>
						</a>
						<div class="relative z-[2]">
							<div class="flex items-center justify-between w-full p-4">
								<div class="flex items-center">
									<iconify-icon
										icon="ic:round-star-outline"
										class="text-3xl text-white duration-100"
									/>
									<span class="text-sm text-white">{test.stars}</span>
								</div>
								<DropdownSelect dropdownTabs={TypesafeTabs(test)}>
									<iconify-icon
										icon="fluent:settings-24-filled"
										class="text-2xl text-white"
									/>
								</DropdownSelect>
							</div>
						</div>
						<div
							class="absolute bottom-0 left-0 w-full px-4 py-1 text-center dark:bg-dark_terciary bg-light_quaternary rounded-b-md text-semiBody1"
						>
							<abbr title={test.title} class="no-underline"
								><h5 class="overflow-hidden text-ellipsis whitespace-nowrap">
									{test.title}
								</h5></abbr
							>
						</div>
					{/if}
					
				</div> -->
			{/each}
		</div>
	{/if}
</div>
<Space />

<style>
	.grid__layout {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	@media screen and (min-width: 1650px) {
		.grid__layout {
			grid-template-columns: repeat(6, minmax(210px, 1fr));
		}
	}
</style>
