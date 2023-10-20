<script lang="ts">
	import { trpc } from '~/lib/trpc/client.js';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import { page } from '$app/stores';
	import TestImageCard from '~components/containers/card/TestImageCard.svelte';
	import Dropdown from '~components/effects/Dropdown.svelte';

	export let data;

	type Test =
		| {
				title: string;
				description: string;
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
			id: id,
			excludeOwnersRecords: true
		});

		tests[index] = testsData.map((test) => {
			return {
				title: test.test.title,
				description: test.test.description,
				takenByPeopleCount: test.test.testVersions[0]._count.records
			};
		});
	}
</script>

<section class="p-2 max-w-[600px] relative">
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
				<div class="grid w-full grid-cols-2 gap-1">
					{#each testArray as testInitial}
						<div class="relative">
							<div
								class="absolute right-2 top-2 shadow-sm dark:shadow-white bg-light_quaternary text-light_text_black dark:bg-dark_quaternary dark:text-dark_text_white z-[5] w-fit whitespace-nowrap grid place-content-center rounded-lg"
							>
								<span>Taken by:</span>
								{testInitial.takenByPeopleCount}
							</div>
							<TestImageCard
								test={{
									title: testInitial.title,
									description: 'See the statistics'
								}}
								url={`/dashboard/my-groups/${data['group']['slug']}/admin-test-overview/${testInitial.title}`}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</Collapsible>
	{/each}
</section>
