<script lang="ts">
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import FilterButton from '~components/inputs/FilterButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { delayResults } from '~helpers/delay';
	import DropdownSelect from '~components/collapsibles/DropdownSelect.svelte';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { createExportedFileAndMakeItDownloadable } from '~/utils/testExport';
	import { getContext } from 'svelte';
	import type { TestFullType } from '~/Prisma';

	const modalTabsGenerator = getContext('modalTabsGenerator');

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

	const TypesafeTabs = (test: TestFullType) => {
		return (modalTabsGenerator as Function)(test);
	};
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
		<div class="grid grid-cols-4 gap-2">
			{#each tests as test}
				<div
					class="relative grid rounded-md aspect-video dark:bg-dark_grey place-content-center"
				>
					{#if test === tests[tests.length - 1]}
						<p class="text-center" use:addIntersection>{test.title}</p>
					{:else}
						<div class="absolute flex items-center left-1 top-1">
							<iconify-icon
								icon="ic:round-star-outline"
								class="text-3xl duration-100 hover:text-yellow-400"
							/>
							<span class="text-sm">{test.stars}</span>
						</div>
						<DropdownSelect dropdownTabs={TypesafeTabs(test)}>
							<iconify-icon
								icon="fluent:settings-24-filled"
								class="text-xl text-light_text_black dark:text-dark_text_white"
							/>
						</DropdownSelect>

						<h6>{test.title}</h6>
						<p
							class="text-center text-body3 text-dark_text_white_40 whitespace-nowrap overflow-ellipsis"
						>
							{test.description}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
<Space />
