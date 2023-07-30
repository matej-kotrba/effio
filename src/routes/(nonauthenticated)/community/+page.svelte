<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import CardMinimalized from '~components/containers/card/CardMinimalized.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import Space from '~components/separators/Space.svelte';
	import CardMinimalizedSkeleton from '~components/containers/card/CardMinimalizedSkeleton.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TagContainer from '~components/containers/tag/TagContainer.svelte';
	import type { Tag } from '@prisma/client';

	export let data;

	const REQUEST_AMOUNT = 8;

	let isFetchingNewTests = true;

	let unusedTags: Tag[] = data.tags;
	let usedTags: Tag[] = [];

	let requestedTests: Awaited<
		ReturnType<ReturnType<typeof trpc>['getPopularTests']['query']>
	>['tests'] = [];

	let observer: IntersectionObserver;

	onMount(async () => {
		isFetchingNewTests = true;

		let response = await trpc($page).getPopularTests.query({
			take: REQUEST_AMOUNT
		});

		isFetchingNewTests = false;

		if (response.success === false || response.tests === undefined) return;

		requestedTests = response.tests;

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(async (entry) => {
					if (entry.isIntersecting) {
						if (requestedTests === undefined) return;

						isFetchingNewTests = true;

						let newData = await trpc($page).getPopularTests.query({
							take: REQUEST_AMOUNT,
							cursor: requestedTests[requestedTests.length - 1].id,
							tags:
								usedTags.length !== 0
									? usedTags.map((tag) => tag.name)
									: undefined
						});

						isFetchingNewTests = false;

						if (!newData.tests) return;

						requestedTests = [...requestedTests, ...newData.tests];

						observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.5
			}
		);
	});

	function addIntersection(element: HTMLElement) {
		observer.observe(element);

		return {
			destroy() {
				observer.unobserve(element);
			}
		};
	}

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

	// for (let i = 0; i < 40; i++) {
	// 	await trpc($page).protected.saveTest.mutate({
	// 		title: 'example',
	// 		description: 'example description which is a bit longer',
	// 		isPublished: true,
	// 		questionContent: JSON.stringify({
	// 			title: 'example question',
	// 			displayType: 'Pick One',
	// 			errors: {},
	// 			id: crypto.randomUUID(),
	// 			content: {
	// 				answers: [
	// 					{
	// 						answer: 'asdasd'
	// 					},
	// 					{
	// 						answer: 'asdasasdadadasdasdd'
	// 					}
	// 				]
	// 			} as PickOneQuestion,
	// 			questionType: 'pickOne',
	// 			questionTypeId: 'edec0330-59a3-45a9-a932-599ccf3c9fe8'
	// 		} as QuestionClient)
	// 	});
	// }

	// console.log(displayedTests.then((data) => console.log(data)));
</script>

<div>
	<div
		class="flex flex-col justify-center mb-4 border-b-2 border-light_text_black"
	>
		<SearchBar />
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
		class="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 place-items-center"
	>
		{#if requestedTests !== undefined}
			{#each requestedTests as test, index}
				{#if index === requestedTests.length - 1}
					<div use:addIntersection class="w-full">
						<button
							type="button"
							on:click={() => {
								goto(`/tests/${test.id}`);
							}}
							class="w-full"
						>
							<CardMinimalized
								title={test.testVersions[0].title}
								description={test.testVersions[0].description}
								author={test.owner.name || 'Anonymous'}
								authorImg={test.owner.image}
								stars={test.stars}
								views={test.views}
								tags={test.tags}
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
							title={test.testVersions[0].title}
							description={test.testVersions[0].description}
							author={test.owner.name || 'Anonymous'}
							authorImg={test.owner.image}
							stars={test.stars}
							views={test.views}
							tags={test.tags}
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
