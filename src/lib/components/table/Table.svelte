<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		createSvelteTable,
		getCoreRowModel,
		getSortedRowModel,
		flexRender
	} from '@tanstack/svelte-table';
	import type {
		ColumnDef,
		OnChangeFn,
		SortingState,
		TableOptions
	} from '@tanstack/svelte-table';
	import type { UserRoles } from '@prisma/client';

	type User = {
		id: string;
		name: string;
		role: UserRoles;
	};

	const mock: User[] = [
		{
			id: '1',
			name: 'John Doe',
			role: 'ADMIN'
		},
		{
			id: '2',
			name: 'Jane Doe',
			role: 'USER'
		}
	];

	const columns: ColumnDef<User>[] = [
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			cell: (info) => info.getValue()
		},
		{
			id: 'id',
			accessorKey: 'id',
			header: 'ID',
			cell: (info) => info.getValue()
		},
		{
			id: 'role',
			accessorKey: 'role',
			header: 'Role',
			cell: (info) => info.getValue()
		}
	];

	let sorting: SortingState = [];

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
		options.update((old) => ({
			...old,
			state: {
				...old.state,
				sorting
			}
		}));
	};

	const options = writable<TableOptions<User>>({
		data: mock,
		columns,
		state: {
			sorting
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		debugTable: true
	});

	const table = createSvelteTable(options);
</script>

<div class="p-2">
	<div class="h-2" />
	<table>
		<thead>
			{#each $table.getHeaderGroups() as headerGroup}
				<tr>
					{#each headerGroup.headers as header}
						<th colSpan={header.colSpan}>
							{#if !header.isPlaceholder}
								<div
									class:cursor-pointer={header.column.getCanSort()}
									class:select-none={header.column.getCanSort()}
									on:click={header.column.getToggleSortingHandler()}
								>
									<svelte:component
										this={flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									/>
									{#if header.column.getIsSorted().toString() === 'asc'}
										🔼
									{:else if header.column.getIsSorted().toString() === 'desc'}
										🔽
									{/if}
								</div>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each $table.getRowModel().rows.slice(0, 10) as row}
				<tr>
					{#each row.getVisibleCells() as cell}
						<td>
							<svelte:component
								this={flexRender(cell.column.columnDef.cell, cell.getContext())}
							/>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<div>{$table.getRowModel().rows.length} Rows</div>
</div>

<style>
	table {
		border: 1px solid lightgray;
	}

	tbody {
		border-bottom: 1px solid lightgray;
	}

	th {
		border-bottom: 1px solid lightgray;
		border-right: 1px solid lightgray;
		padding: 2px 4px;
	}

	tfoot {
		color: gray;
	}

	tfoot th {
		font-weight: normal;
	}
</style>
