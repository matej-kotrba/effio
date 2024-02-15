<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		createSvelteTable,
		getCoreRowModel,
		getSortedRowModel,
		flexRender,
		renderComponent
	} from '@tanstack/svelte-table';
	import type {
		ColumnDef,
		OnChangeFn,
		RowSelectionState,
		SortingState,
		TableOptions
	} from '@tanstack/svelte-table';
	import type { UserRoles } from '@prisma/client';
	import RowCheckBox from './RowCheckBox.svelte';

	export let data: User[] = [];

	$: {
		options.update((options) => ({
			...options,
			data
		}));
	}

	type User = {
		id: string;
		name: string;
		role: UserRoles;
	};

	const columns: ColumnDef<User>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(RowCheckBox, {
					checked: table.getIsAllRowsSelected(),
					indeterminate: table.getIsSomeRowsSelected(),
					onChange: table.getToggleAllRowsSelectedHandler()
				}),
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
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
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
	let selection: RowSelectionState = {};

	const onSelect = (updater: any) => {
		if (updater instanceof Function) {
			selection = updater(selection);
		} else {
			selection = updater;
		}

		options.update(
			(old) =>
				({
					...old,
					state: {
						...old.state,
						rowSelection: selection
					}
				} as TableOptions<User>)
		);
	};

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
		data: data,
		columns,
		state: {
			sorting,
			rowSelection: selection
		},
		enableRowSelection: true,
		onRowSelectionChange: onSelect,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		debugTable: true
	});

	const table = createSvelteTable(options);

	$: console.log(selection);
</script>

<div class="p-2">
	<table
		class="w-full max-w-[900px] border-collapse border-[2px] border-gray-300"
	>
		<thead class="">
			{#each $table.getHeaderGroups() as headerGroup}
				<tr class="border-gray-300 border-solid border-y-[1px] bg-gray-100">
					{#each headerGroup.headers as header}
						<th colSpan={header.colSpan} class="text-left">
							{#if !header.isPlaceholder}
								<div
									class:cursor-pointer={header.column.getCanSort()}
									class:select-none={header.column.getCanSort()}
									on:click={header.column.getToggleSortingHandler()}
									class="flex items-center font-semibold"
								>
									<svelte:component
										this={flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									/>
									{#if header.column.getIsSorted().toString() === 'asc'}
										<span>🔼</span>
									{:else if header.column.getIsSorted().toString() === 'desc'}
										<span>🔽</span>
									{:else}
										<span class="opacity-0">🔽</span>
									{/if}
								</div>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each $table.getRowModel().rows.slice(0, 10) as row, index}
				<tr
					class="border-gray-300 border-solid border-y-[1px] bg-slate-50 {selection[
						index
					]
						? 'bg-indigo-100'
						: ''}"
				>
					{#each row.getVisibleCells() as cell}
						<td>
							<div class="flex items-center">
								<svelte:component
									this={flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								/>
							</div>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<div>{$table.getRowModel().rows.length} Rows</div>
</div>

<style>
	td,
	th {
		padding: 0.6rem;
	}
</style>
