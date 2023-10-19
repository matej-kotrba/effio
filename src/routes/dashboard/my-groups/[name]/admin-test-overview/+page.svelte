<script lang="ts">
	import { trpc } from '~/lib/trpc/client.js';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import { page } from '$app/stores';

	export let data;

	type Test =
		| {
				title: string;
				takenByPeopleCount: number;
				img?: string;
		  }[];

	type TestOrFetching = Test | undefined;

	let tests: TestOrFetching[] = data['group']['groupsSubcategories'].map(
		() => undefined
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
</script>

<section class="p-2 max-w-[600px]">
	{#each data['group']['groupsSubcategories'] as subcategory, index}
		<Collapsible
			title={subcategory.name}
			class="w-full bg-light_grey"
			buttonClasses="bg-light_grey_dark"
			onOpen={() => setTestForSubcategory(subcategory.id, index)}
		>
			{@const testArray = tests[index]}
			{#if testArray === undefined}
				<div class="flex justify-center">
					<span class="loading loading-bars loading-lg" />
				</div>
			{:else}
				{#each testArray as testInitial}{/each}
			{/if}
		</Collapsible>
	{/each}
</section>
