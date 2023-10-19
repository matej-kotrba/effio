<script lang="ts">
	import { trpc } from '~/lib/trpc/client.js';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import { page } from '$app/stores';
	import { test } from 'vitest';

	export let data;

	type Test =
		| {
				title: string;
				takenByPeopleCount: number;
				img?: string;
		  }[];

	type TestOrFetching = Test | 'fetching';

	let tests: TestOrFetching[] = data['group']['groupsSubcategories'].map(
		() => 'fetching'
	);

	async function setTestForSubcategory(id: string, index: number) {
		const testsData = await trpc(
			$page
		).groups.getSubcategoryTestsByIdWithRecords.query({
			id: id
		});

		tests[index] = testsData.map((test) => {
			return {
				title: test.test.title,
				takenByPeopleCount: test.test.testVersions[0]._count.records
			};
		});
	}

	function checkTestStatus(test: TestOrFetching): test is Test {
		return test !== 'fetching';
	}

	function getRetypedTest(test: TestOrFetching): Test {
		return test as Test;
	}
</script>

<section class="p-2 max-w-[600px]">
	{#each data['group']['groupsSubcategories'] as subcategory, index}
		<Collapsible
			title={subcategory.name}
			class="w-full bg-light_grey"
			buttonClasses="bg-light_grey_dark"
			onOpen={() => setTestForSubcategory(subcategory.id, index)}
		>
			{#if checkTestStatus(tests[index]) === false}
				<div class="flex justify-center">
					<span class="loading loading-bars loading-lg" />
				</div>
			{:else}
				{#each tests[index] as testInitial}
					{@const test = getRetypedTest(testInitial)}
				{/each}
			{/if}
		</Collapsible>
	{/each}
</section>
