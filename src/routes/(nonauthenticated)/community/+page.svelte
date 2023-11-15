<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
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
	import Carousel from '~components/containers/Carousel.svelte';
	import { browser } from '$app/environment';
	import toast from 'svelte-french-toast';
	import type { CardAlternativeProps } from '~components/containers/card/CardAlternative.svelte';
	import CardAlternative from '~components/containers/card/CardAlternative.svelte';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const [send, receive] = crossfade({
		duration: 150
	});

	export let data;

	const REQUEST_AMOUNT = 12;

	let isFetchingNewTests = true;
	let isResetting = false;

	let searchQuery: string = $page.url.searchParams.get('q') || '';

	let usedTags: Tag[] = [];

	let requestedTests: Awaited<
		ReturnType<ReturnType<typeof trpc>['getPopularTests']['query']>
	>['tests'] = [];

	let allTestsRef: HTMLDivElement;

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
					createdAt: item.createdAt,
					stars: item.stars
				} satisfies CardAlternativeProps;
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
		specificQuery: string | undefined = undefined,
		usedTags: string[] = []
	) {
		// requestedTests = [
		// 	...requestedTests,
		// 	{
		// 		id: 0,
		// 		createdAt: new Date(),
		// 		title: 'asdasda sasdas',
		// 		description:
		// 			'awhdas dhasd uxych usd hahdcyuixch yxjhc uiawsh djakshdais',
		// 		owner: { name: 'aaaaaa aaaaa', image: '' },
		// 		stars: 0,
		// 		views: 0,
		// 		tags: [],
		// 		isPublic: false,
		// 		ownerId: '',
		// 		questions: [],
		// 		__typename: 'Test',
		// 		published: true,
		// 		testVersions: 1,
		// 		updatedAt: new Date(),
		// 		version: 1
		// 	}
		// ];
		// return;
		if (requestedTests === undefined) return;

		if (shouldReset) isResetting = true;
		isFetchingNewTests = true;

		// await new Promise((res) => setTimeout(res, 5000));
		let newData = await trpc($page).getPopularTests.query({
			take: REQUEST_AMOUNT,
			cursor:
				shouldReset === false
					? requestedTests[requestedTests.length - 1]?.id ?? undefined
					: undefined,
			tags: usedTags.length !== 0 ? usedTags : undefined,
			searchQuery: specificQuery ?? undefined
		});

		isFetchingNewTests = false;
		if (shouldReset) isResetting = false;

		if (shouldReset) {
			requestedTests = [];
		}

		if (!newData.tests) return;

		requestedTests = [...requestedTests, ...newData.tests];
	}

	let addIntersectionUse: CreateObserverReturn['addIntersection'];

	onMount(() => {
		const { observer, addIntersection } = createObserver({
			callback: (entry, observer) => {
				if (entry.isIntersecting) {
					getTests(
						false,
						searchQuery,
						usedTags.map((tag) => tag.name)
					);

					observer.unobserve(entry.target);
				}
			}
		});
		addIntersectionUse = addIntersection;
		// Get initial state of the tests (by search params if available)
		getTests(
			false,
			$page.url.searchParams.get('q') || undefined,
			usedTags.map((tag) => tag.name)
		);

		return () => {
			observer.disconnect();
		};
	});

	function findTagFromArrayBySlug(slug: Tag['slug'], tags: Tag[]) {
		return tags.find((item) => item.slug === slug);
	}

	async function changeToggleStatus(slug: string, isActive: boolean) {
		if (isActive === false) {
			const tag = findTagFromArrayBySlug(slug, usedTags);
			if (!tag) return;
			usedTags = usedTags.filter((tempTag) => tempTag.id !== tag.id);
		} else {
			const tag = findTagFromArrayBySlug(slug, data.tags);
			if (!tag) return;
			if (usedTags.includes(tag)) return;
			usedTags = [...usedTags, tag];
		}

		isFetchingNewTests = true;

		getTests(
			true,
			searchQuery,
			usedTags.map((tag) => tag.name)
		);

		isFetchingNewTests = false;
	}

	// Search for results on inpput change, wait 500ms befor sending request for optimization
	async function searchForResults(value: string) {
		if (allTestsRef) {
			window.scrollTo({
				top: allTestsRef.getBoundingClientRect().top + window.scrollY - 100,
				behavior: 'smooth'
			});
		}
		if (value === searchQuery) return;
		searchQuery = value;
		updateUrl(value);
		await getTests(
			true,
			value,
			usedTags.map((tag) => tag.name)
		);
	}

	function getTypesafeTags(tags: TestFullType['tags']) {
		return tags.map((item) => item.tag) as Tag[];
	}
</script>

<SearchBar searchFunction={searchForResults} initialValue={searchQuery} />
<Space gap={10} />
<div class="relative">
	<div
		style={`--height-value: 120%;`}
		class="absolute left-0 w-full bg z-[0] h-[var(--height-value)] -translate-y-[calc(var(--height-value)/2-50%)] text-white cover-text"
	>
		<div class="inner-text">
			<h3
				class="relative italic font-bold text-h3 underline-effect after:bg-light_quaternary"
			>
				New and popular
			</h3>
		</div>
	</div>
	<h3
		class="relative italic font-bold text-h3 underline-effect -z-[20] after:bg-light_primary"
	>
		New and popular
	</h3>
	<div class="max-h-[24rem] h-[24rem] relative isolate">
		{#if browser}
			<Carousel data={getPopularTests()} />
		{/if}
	</div>
</div>

<div>
	<div
		class="flex flex-col justify-center mb-4 border-b-2 border-light_text_black"
	>
		<Space gap={10} />
		<h4>Filter by a tag</h4>
		<div class="flex flex-col justify-center gap-1">
			<div class="flex flex-wrap gap-1 min-h-[3rem]">
				{#each data.tags.filter((tag) => !usedTags.includes(tag)) as tag, index (tag.slug)}
					<div
						in:send={{ key: tag.slug }}
						out:receive={{ key: tag.slug }}
						animate:flip={{ duration: 100 }}
					>
						<TagContainer
							title={tag.name}
							color={tag.color}
							isActive={false}
							on:activeToggle={(data) =>
								changeToggleStatus(tag.slug, data.detail)}
						/>
					</div>
				{/each}
			</div>
			<div class="flex flex-wrap gap-1 min-h-[3rem]">
				{#each data.tags.filter( (tag) => usedTags.includes(tag) ) as tag, index (tag.slug)}
					<div
						in:send={{ key: tag.slug }}
						out:receive={{ key: tag.slug }}
						animate:flip={{ duration: 100 }}
					>
						<TagContainer
							title={tag.name}
							color={tag.color}
							isActive={true}
							on:activeToggle={(data) =>
								changeToggleStatus(tag.slug, data.detail)}
						/>
					</div>
				{/each}
			</div>
		</div>
		<Space gap={10} />
	</div>
	<div
		bind:this={allTestsRef}
		class={`relative grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 min-h-[24rem] ${
			isResetting ? 'opacity-40' : 'opacity-100'
		}`}
	>
		{#if requestedTests !== undefined}
			{#if requestedTests.length === 0}
				<div
					class="absolute left-0 w-full text-center -translate-y-1/2 top-1/2"
				>
					<iconify-icon
						icon="solar:mask-sad-linear"
						class="text-8xl text-light_text_black_20 dark:text-dark_text_white_20"
					/>
					<h3
						class="font-semibold text-center uppercase text-h4 text-light_text_black_60"
					>
						No test matches this criteria.
					</h3>
				</div>
			{:else}
				{#each requestedTests as test, index}
					{#if index === requestedTests.length - 1}
						<div use:addIntersectionUse={{ shouldActive: true }} class="w-full">
							<a href={`/tests/${test.id}`} class="w-full">
								<CardAlternative
									data={{
										title: test.title,
										description: test.description,
										img: undefined,
										icon: test?.owner?.image || 'error',
										createdAt: test.createdAt,
										stars: test.stars,
										tags: getTypesafeTags(test.tags)
									}}
								/>
							</a>
						</div>
					{:else}
						<a href={`/tests/${test.id}`}>
							<CardAlternative
								data={{
									title: test.title,
									description: test.description,
									img: undefined,
									icon: test?.owner?.image || 'error',
									createdAt: test.createdAt,
									stars: test.stars,
									tags: getTypesafeTags(test.tags)
								}}
							/>
						</a>
					{/if}
				{/each}
			{/if}
		{/if}
		{#if isFetchingNewTests}
			{#each Array(REQUEST_AMOUNT) as _}
				<CardMinimalizedSkeleton />
			{/each}
		{/if}
	</div>
</div>

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
