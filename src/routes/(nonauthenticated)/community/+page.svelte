<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import CardMinimalized from '~components/containers/card/CardMinimalized.svelte';

	const REQUEST_AMOUNT = 8;

	// const displayedTests = trpc($page).getPopularTests.query({
	// 	take: REQUEST_AMOUNT
	// });

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

<!-- {#await displayedTests}
	<p>Loading...</p>
{:then tests}
	{#if tests['tests']} -->
<CardMinimalized
	title={'asdac xjhcas dhaxjcajkxca js sads'}
	description={'asdsj hxcjh yxjch uiaehdk jahxcjakd ashjaxcb aksh dkajhd ajcbkashdh axjcyxc hkajshd akjsd axjkcbkjash dc'}
	author={'Anonymous'}
	stars={23}
	views={45}
/>
<CardMinimalized
	title={'xjcajkxcaas'}
	description={'axjkcb asd sdskjash dc'}
	author={'Anonymous'}
	stars={23}
	views={45}
/>
<!-- {#each tests['tests'] as test}
			<CardMinimalized
				title={test.testVersions[0].title}
				description={test.testVersions[0].description}
				author={test.owner.name || 'Anonymous'}
				authorImg={test.owner.image}
				stars={test.stars}
				views={test.views}
			/>
		{/each} -->
<!-- {/if}
{/await} -->
