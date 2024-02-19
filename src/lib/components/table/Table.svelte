<script lang="ts" context="module">
	export type User = {
		id: string;
		name: string;
		role: UserRoles;
	};
</script>

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
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers';
	import { NONAUTHENTICATED_NAV_HEIGHT } from '~components/page-parts/Navbar.svelte';

	export let data: User[] = [];
	export let tableSelection: RowSelectionState = {};

	$: {
		options.update((options) => ({
			...options,
			data
		}));
	}

	const columns: ColumnDef<User>[] = [
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

	const onSelect = (updater: any) => {
		if (updater instanceof Function) {
			tableSelection = updater(tableSelection);
		} else {
			tableSelection = updater;
		}

		options.update(
			(old) =>
				({
					...old,
					state: {
						...old.state,
						rowSelection: tableSelection
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
			rowSelection: tableSelection
		},
		enableRowSelection: true,
		onRowSelectionChange: onSelect,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel()
	});

	export const table = createSvelteTable(options);

	const dispatch = createEventDispatcher();

	function onLastRowIntersection() {
		dispatch('last-row-intersection');
	}

	let addIntersectionUse: CreateObserverReturn['addIntersection'];

	onMount(() => {
		const { observer, addIntersection } = createObserver({
			callback: (entry, observer) => {
				if (entry.isIntersecting) {
					console.log('Intersecting');
					onLastRowIntersection();

					observer.unobserve(entry.target);
				}
			}
		});
		addIntersectionUse = addIntersection;

		onLastRowIntersection();

		return () => {
			observer.disconnect();
		};
	});
</script>

<div class="p-2 grid__container">
	<div>
		<div
			class="relative overflow-y-auto border-collapse overscroll-contain"
			style="max-height: calc(100vh - {NONAUTHENTICATED_NAV_HEIGHT}px - 16px - 3em);"
		>
			<table class="w-full max-w-[900px]">
				<thead class="">
					{#each $table.getHeaderGroups() as headerGroup, index}
						<tr class="border-gray-300 border-solid border-[1px] bg-gray-100">
							{#each headerGroup.headers as header}
								<th colSpan={header.colSpan} class="text-left">
									{#if !header.isPlaceholder}
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<!-- svelte-ignore a11y-no-static-element-interactions -->
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
											{:else if header.column
												.getIsSorted()
												.toString() === 'desc'}
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
					{#each $table.getRowModel().rows as row, index}
						{#if index === data.length - 1}
							<tr
								use:addIntersectionUse={{ shouldActive: true }}
								class="border-gray-300 border-solid border-[1px] bg-slate-50 {tableSelection[
									index
								]
									? 'bg-violet-200'
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
						{:else}
							<tr
								class="border-gray-300 border-solid border-[1px] bg-slate-50 {tableSelection[
									index
								]
									? 'bg-violet-200'
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
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
		<div>{$table.getRowModel().rows.length} Rows</div>
	</div>
	<div>
		<slot />
	</div>
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: min(100%, 900px) 1fr;
		gap: 1em;
	}

	td,
	th {
		padding: 0.6rem;
	}
</style>
