<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import Table from '~components/table/Table.svelte';
	import {
		renderComponent,
		type ColumnDef,
		type RowSelectionState
	} from '@tanstack/svelte-table';
	import type { Table as TableType } from '@tanstack/svelte-table';
	import type { Readable } from 'svelte/store';
	import RowCheckBox from '~components/table/RowCheckBox.svelte';
	import type { AdminLogsActions } from '@prisma/client';

	const USERS_LIMIT = 20;

	type Log = {
		id: string;
		author: string;
		action: AdminLogsActions;
		message: string;
	};

	const columns: ColumnDef<Log>[] = [
		{
			id: 'select',
			// header: ({ table }) =>
			// 	renderComponent(RowCheckBox, {
			// 		checked: table.getIsAllRowsSelected(),
			// 		indeterminate: table.getIsSomeRowsSelected(),
			// 		onChange: table.getToggleAllRowsSelectedHandler()
			// 	}),
			cell: (props) =>
				renderComponent(RowCheckBox, {
					checked: props.row.getIsSelected(),
					disabled: !props.row.getCanSelect(),
					indeterminate: props.row.getIsSomeSelected(),
					onChange: props.row.getToggleSelectedHandler()
				})
		},
		{
			id: 'id',
			accessorKey: 'id',
			header: 'ID',
			cell: (info) => info.getValue()
		},
		{
			id: 'author',
			accessorKey: 'author',
			header: 'Author',
			cell: (info) => info.getValue()
		},
		{
			id: 'action',
			accessorKey: 'action',
			header: 'Action',
			cell: (info) => info.getValue()
		},
		{
			id: 'message',
			accessorKey: 'message',
			header: 'Message',
			cell: (info) => info.getValue()
		}
	];

	let logs: Awaited<
		ReturnType<ReturnType<typeof trpc>['admin']['getAdminLogs']['query']>
	> = [];

	let table: Readable<TableType<Log>>;

	let tableSelection: RowSelectionState = {};

	async function getNewLogs(reset: boolean = false) {
		const newUsers = await trpc($page).admin.getUsersAdmin.query({
			limit: USERS_LIMIT,
			cursor: logs[logs.length - 1]?.id
		});
		if (reset) {
			logs = newUsers;
		} else {
			logs = [...logs, ...newUsers];
		}
	}
</script>

<Table
	on:last-row-intersection={() => getNewLogs(false)}
	bind:tableSelection
	bind:table
	data={logs.map((item) => {
		return {
			id: item.id,
			name: item.name ?? '',
			role: item.role
		};
	})}
/>
