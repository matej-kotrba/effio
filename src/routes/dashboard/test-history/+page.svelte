<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { TestRecord, TestVersion } from '@prisma/client';
	import { goto } from '$app/navigation';

	export let data;

	type RecordType = TestRecord & {
		test: TestVersion;
	};

	let records: RecordType[] = [];
	let isFetching = true;

	onMount(async () => {
		if (!data?.session?.user?.id) return;
		isFetching = true;

		const recordsResponse = await trpc($page).records.getUserRecords.query({
			id: data?.session?.user?.id
		});

		records = recordsResponse.records;
		isFetching = false;
	});
</script>

<DashboardTitle
	title="Test History"
	subtitle="Browser through your test records."
/>

{#if isFetching}
	<div class="flex justify-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:else}
	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr class="dark:text-dark_text_white">
					<th>Name</th>
					<th>Taken at</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->

				{#each records as record}
					<tr
						class="cursor-pointer hover:bg-base-200 dark:hover:bg-dark_text_white_20 dark:text-dark_text_white"
						on:click={() => {
							goto('/dashboard/test-history/records/' + record.id);
						}}
					>
						<td>{record.title}</td>
						<td>{new Date(record.createdAt).toLocaleDateString('en-GB')}</td>
						<td class="max-w-lg overflow-hidden text-ellipsis whitespace-nowrap"
							>{record.description}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
