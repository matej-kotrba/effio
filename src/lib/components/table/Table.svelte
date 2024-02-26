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
		RowSelectionState,
		SortingState,
		TableOptions
	} from '@tanstack/svelte-table';
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers';

	export let data: any[] = [];
	export let tableSelection: RowSelectionState = {};
	export let maxHeight: string = 'auto';
	export let columns: ColumnDef<any>[] = [];
	export let isTableDisabled: boolean = false;

	$: {
		options.update((options) => ({
			...options,
			data
		}));
	}

	let sorting: SortingState = [];

	const onSelect = (updater: any) => {
		if (isTableDisabled) return;
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
				} as TableOptions<unknown>)
		);
	};

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		if (isTableDisabled) return;
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
		dispatch('sorting-change', sorting);
		console.log(sorting);
	};

	const options = writable<TableOptions<any>>({
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
		// TODO: This is not functional on 100%
		if (isTableDisabled) return;
		dispatch('last-row-intersection');
	}

	let addIntersectionUse: CreateObserverReturn['addIntersection'];

	onMount(() => {
		const { observer, addIntersection } = createObserver({
			callback: (entry, observer) => {
				if (entry.isIntersecting) {
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

<div class="p-2">
	<div>
		<div
			class="relative overflow-y-auto border-collapse overscroll-contain"
			style="max-height: {maxHeight}"
		>
			<table class="w-full">
				<thead
					class="sticky top-0 z-10 w-full before:content-[''] before:inset-0 before:bg-gray-100 before:absolute isolate before:z-[-99]"
				>
					{#each $table.getHeaderGroups() as headerGroup, index}
						<tr class="outline-gray-300 outline outline-[1px] w-full">
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
								{#if $$slots.options}
									<td>
										<slot name="options" rowIndex={index} />
									</td>
								{/if}
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
								{#if $$slots.options}
									<td>
										<slot name="options" rowIndex={index} />
									</td>
								{/if}
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
