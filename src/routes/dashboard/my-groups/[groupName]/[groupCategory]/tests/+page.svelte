<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { trpc } from '~/lib/trpc/client.js';
	import TestImageCard from '~components/containers/card/TestImageCard.svelte';

	export let data;

	let tests: Awaited<
		ReturnType<
			ReturnType<typeof trpc>['groups']['getSubcategoryTestsById']['query']
		>
	> = [];

	onMount(async () => {
		const fetchedTests = await trpc($page).groups.getSubcategoryTestsById.query(
			{
				id: data.subcategory.id,
				orderByDate: 'desc'
			}
		);

		tests = fetchedTests;
	});
</script>

<div class="p-2 grid__container">
	{#each tests as test}
		<TestImageCard
			test={test.test}
			url={`/dashboard/my-groups/${data.group.slug}/${data.subcategory.slug}/tests/${test.testId}`}
		/>
	{/each}
</div>

<!-- <div class="flex flex-col h-full gap-2">
	{#if tests.length === 0}
		<div
			class="absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-content-center left-1/2 top-1/2"
		>
			<iconify-icon
				icon="solar:mask-sad-linear"
				class="grid place-content-center text-8xl text-light_text_black_20 dark:text-dark_text_white_20"
			/>
			<p>No tests here</p>
		</div>
	{:else}
		{#each tests as test}
			<div class="relative">
				{#if data.group.ownerId === data.session.user?.id}
					<a
						href={`/dashboard/my-groups/${data.group.slug}/admin-test-overview/${data.subcategory.slug}/${test.testId}`}
						class="absolute top-0 left-0 z-10 p-1 icon-gradient"
					>
						<iconify-icon
							icon="carbon:result"
							class="text-3xl text-white shadow-sm"
						/>
					</a>
				{/if}
				<TestImageCard
					test={test.test}
					url="/dashboard/my-groups/{data.group.slug}/{data.subcategory
						.slug}/tests/{test.testId}"
				/>
			</div>
		{/each}
	{/if}
</div> -->

<style>
	.grid__container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}
</style>
