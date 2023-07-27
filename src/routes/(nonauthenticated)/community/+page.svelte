<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import CardMinimalized from '~components/containers/card/CardMinimalized.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import Space from '~components/separators/Space.svelte';
	import CardMinimalizedSkeleton from '~components/containers/card/CardMinimalizedSkeleton.svelte';

	const REQUEST_AMOUNT = 8;

	const displayedTests = trpc($page).getPopularTests.query({
		take: REQUEST_AMOUNT
	});

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
	</div>
	<div
		class="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 place-items-center"
	>
		{#await displayedTests}
			{#each Array(REQUEST_AMOUNT) as _}
				<CardMinimalizedSkeleton />
			{/each}
		{:then tests}
			{#if tests['tests']}
				{#each tests['tests'] as test}
					<CardMinimalized
						title={test.testVersions[0].title}
						description={test.testVersions[0].description}
						author={test.owner.name || 'Anonymous'}
						authorImg={test.owner.image}
						stars={test.stars}
						views={test.views}
					/>
				{/each}
			{/if}
		{/await}
	</div>
</div>
