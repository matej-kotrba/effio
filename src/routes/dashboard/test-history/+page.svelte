<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Test, TestRecord } from '@prisma/client';

	export let data;

	type RecordType = TestRecord & {
		test: Test;
	};

	let records: RecordType[] = [];

	onMount(async () => {
		if (!data?.session?.user?.id) return;

		const recordsResponse = await trpc($page).records.getUserRecords.query({
			id: data?.session?.user?.id
		});

		records = recordsResponse.records as unknown as RecordType[];
	});
</script>

<DashboardTitle
	title="Test History"
	subtitle="Browser through your test records."
/>

<div class="overflow-x-auto">
	<table class="table">
		<!-- head -->
		<thead>
			<tr>
				<th>Name</th>
				<th>Taken at</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<!-- row 1 -->
			{#each records as record}
				<tr class="hover:bg-base-200">
					<td>{record.test.title}</td>
					<td>{new Date(record.createdAt).toLocaleDateString('en-GB')}</td>
					<td class="max-w-lg overflow-hidden text-ellipsis whitespace-nowrap"
						>{record.test.description}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
