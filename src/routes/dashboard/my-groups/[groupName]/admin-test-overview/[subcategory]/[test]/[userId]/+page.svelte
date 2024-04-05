<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[testId]/+page.svelte';
	import Table from '~components/table/Table.svelte';
	import { getMarkBasedOnPoints } from '~helpers/test/test.js';
	import { transformDate } from '~utils/date.js';

	export let data;

	const user = data.group.users.find(
		(user) => user.userId === $page.params.userId
	)?.user;

	const columns: ColumnDef<TableData>[] = [
		{
			id: 'takenAt',
			accessorKey: 'takenAt',
			header: 'Taken at',
			cell: (info) => transformDate(info.getValue() as Date, { time: true })
		},
		{
			id: 'points',
			accessorKey: 'points',
			header: 'Points',
			cell: (info) => info.getValue()
		},
		{
			id: 'percentage',
			accessorKey: 'percentage',
			header: 'Percentage',
			cell: (info) => info.getValue()
		},
		{
			id: 'mark',
			accessorKey: 'mark',
			header: 'Mark',
			cell: (info) => info.getValue()
		}
	];

	type TableData = {
		takenAt: Date | undefined;
		points: string;
		percentage: string;
		mark: string;
	};

	const tableData: TableData[] = data.usersTestRecords.map((record) => {
		let markSystem;
		let markSystemMarks = checkMarkSystem(record.test.markSystemJSON);
		if (markSystemMarks) {
			markSystem = getMarkBasedOnPoints(
				markSystemMarks,
				record.userPoints,
				record.test.totalPoints
			);
		}
		return {
			takenAt: record.createdAt,
			points: `${record.userPoints} / ${record.test.totalPoints}`,
			percentage: `${(
				(record.test.totalPoints / record.userPoints) *
				100
			).toFixed(1)}%`,
			mark: markSystem ? markSystem.name : 'x'
		};
	});

	function onRowClick(props: TableData) {
		goto('');
	}
</script>

<div class="p-2">
	{#if !user || user['id'] === data.group.ownerId}
		<div class="grid mt-4 place-content-center">
			<span class="text-h4">No user like this exists in this group!</span>
			<a
				href="/dashboard/my-groups/{data.group.slug}"
				class="btn btn-outline dark:text-white dark:border-white"
			>
				Back to group
			</a>
		</div>
	{:else}
		<h3 class="flex items-center gap-1 text-h5">
			<span>{data.test.title}</span>
			<span
				class="text-h4 text-light_text_black_20 dark:text-dark_text_white_20"
				>/</span
			>
			<span>{user.name}</span>
		</h3>
		<div class="mt-4">
			{#if tableData.length === 0}
				<div class="grid place-content-center">
					<span class="text-h4"
						>Sorry, this user has not done the test yet.</span
					>
				</div>
			{:else}
				<Table {columns} data={tableData} {onRowClick} />
			{/if}
		</div>
	{/if}
</div>
