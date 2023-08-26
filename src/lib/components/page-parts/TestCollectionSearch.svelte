<script lang="ts">
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import FilterButton from '~components/inputs/FilterButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { delayResults } from '~helpers/delay';

	let observer: IntersectionObserver;

	let searchQuery: string = '';
	let isFetchingNewTests: boolean = false;
	let tests: Awaited<
		ReturnType<ReturnType<typeof trpc>['getUserTestsById']['query']>
	> = [];

	async function getTests(shouldReset: boolean = false) {
		if (tests === undefined) return;
		if (shouldReset) {
			tests = [];
		}

		isFetchingNewTests = true;

		console.log(tests[tests.length - 1]?.id);
		const data = await trpc($page).getUserTestsById.query({
			// @ts-ignore
			id: $page.data.session?.user?.id,
			limit: 4,
			cursor: tests[tests.length - 1] ? tests[tests.length - 1].id : undefined,
			searchQuery: searchQuery
		});
		tests = [...tests, ...data];
	}

	function addIntersection(element: HTMLElement) {
		observer.observe(element);

		return {
			destroy() {
				observer.unobserve(element);
			}
		};
	}

	let searchRequests: Array<Promise<string> | string> = [];

	async function searchForResults(value: string) {
		const searchQueryPromise = delayResults(500, value);
		searchRequests.unshift(searchQueryPromise);
		const searchQueryResult = await searchQueryPromise;

		if (searchRequests.length === 1) {
			searchQuery = searchQueryResult;
			getTests(true);
		}
		searchRequests.pop();
	}

	onMount(async () => {
		// Get initial state of the tests
		getTests(false);

		// Observing last element to fetch more tests, then unobserving it
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(async (entry) => {
					if (entry.isIntersecting) {
						getTests();

						observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.5
			}
		);
	});
</script>

<div class="flex items-center justify-center gap-2 px-12">
	<SearchBar searchFunction={searchForResults} />
	<FilterButton
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
<div>
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
		{#each tests as test}
			{#if test === tests[tests.length - 1]}
				<p use:addIntersection>{test.title}</p>
			{:else}
				<p>{test.title}</p>
			{/if}
		{/each}
	{/if}
</div>
<Space />
