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
		  }[]
		| 'fetching';

	let tests: Test[] = data['group']['groupsSubcategories'].map(
		() => 'fetching'
	);

	async function getTestForSubcategory(id: string) {
		const tests = await trpc($page).groups.getSubcategoryTestsById.query({
			id: id,
			getRecordData: true
		});
		console.log(tests);
	}
</script>

<section class="p-2 max-w-[600px]">
	{#each data['group']['groupsSubcategories'] as subcategory, index}
		<Collapsible
			title={subcategory.name}
			class="w-full bg-light_grey"
			buttonClasses="bg-light_grey_dark"
			onOpen={() => getTestForSubcategory(subcategory.id)}
		>
			{#if tests[index] === 'fetching'}
				<div class="flex justify-center">
					<span class="loading loading-bars loading-lg" />
				</div>
			{/if}
		</Collapsible>
	{/each}
</section>
