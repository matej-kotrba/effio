<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import Table from '~components/table/Table.svelte';
	import TableActionButton from '../../../lib/components/table/TableActionButton.svelte';
	import {
		renderComponent,
		type RowSelectionState
	} from '@tanstack/svelte-table';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import toast from 'svelte-french-toast';
	import { createTRPCErrorNotification } from '~/lib/utils/notification';
	import { TRPCClientError } from '@trpc/client';
	import type {
		ColumnDef,
		ColumnSort,
		Table as TableType
	} from '@tanstack/svelte-table';
	import type { Readable } from 'svelte/store';
	import { NONAUTHENTICATED_NAV_HEIGHT } from '~components/page-parts/Navbar.svelte';
	import { UserRoles } from '@prisma/client';
	import RowCheckBox from '~components/table/RowCheckBox.svelte';
	import * as DropdownMenu from '~/lib/components/ui/dropdown-menu';
	import { transformDate } from '~/lib/utils/date';
	import CustomTableTile from '~components/table/CustomTableTile.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';

	const TESTS_LIMIT = 20;

	type Test = {
		id: string;
		title: string;
		ownerName: string;
	};

	const columns: ColumnDef<Test>[] = [
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
			id: 'title',
			accessorKey: 'title',
			header: 'Title',
			cell: (info) =>
				renderComponent(CustomTableTile, {
					originalData: info.getValue(),
					onClick: () => {},
					class:
						'whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[250px]'
				})
		},
		{
			id: 'ownerName',
			accessorKey: 'ownerName',
			header: 'Owner Name',
			cell: (info) => info.getValue()
		},
		{
			id: 'createdAt',
			accessorKey: 'createdAt',
			header: 'Created At',
			cell: (info) => info.getValue()
		}
	];

	let searchInputValue: string = '';

	let tests: Awaited<
		ReturnType<ReturnType<typeof trpc>['admin']['getTestsAdmin']['query']>
	> = [];

	let table: Readable<TableType<Test>>;
	let groupOperationsHeight: number;

	let tableSelection: RowSelectionState = {};

	let isResetingTableValues = false;

	async function getNewTests(
		reset: boolean = false,
		searchQuery?: string,
		sorting?: ColumnSort
	) {
		if (reset) {
			isResetingTableValues = true;
		}
		try {
			const newTests = await trpc($page).admin.getTestsAdmin.query({
				limit: TESTS_LIMIT,
				cursor: reset ? undefined : tests[tests.length - 1]?.id,
				searchQuery,
				order: sorting?.id || 'name',
				orderBy: sorting?.desc ? 'desc' : 'asc'
			});
			if (reset) {
				tests = [];
			}
			tests = [...tests, ...newTests];
		} catch (_) {
		} finally {
			isResetingTableValues = false;
		}
	}

	let isFetchingAction = false;

	async function deleteTestsFromDB() {
		isFetchingAction = true;
		const usersToDelete = Object.entries(tableSelection).map(([index, _]) => {
			return { name: tests[+index].title, id: tests[+index].id };
		});

		let deletedUsers = 0;
		try {
			deletedUsers = await trpc($page).admin.deleteUsersAdmin.mutate({
				usersIds: usersToDelete.map((user) => user.id)
			});
		} catch (e) {
			if (e instanceof TRPCClientError) {
				createTRPCErrorNotification(e);
			} else {
				toast.error('Unknown error occurred');
			}
		}

		isFetchingAction = false;

		if (deletedUsers > 0) {
			tests = tests.filter((user) => {
				return !usersToDelete.some((userToDelete) => {
					return userToDelete.id === user.id;
				});
			});
			$table.resetRowSelection();

			toast.success(`Deleted ${deletedUsers} user(s)`);
		}
	}

	function onTableSortChange(e: CustomEvent<ColumnSort[]>) {
		getNewTests(true, searchInputValue, e.detail[0]);
	}
</script>

<div class="p-2" bind:clientHeight={groupOperationsHeight}>
	<div class="mb-2">
		<h3 class="font-semibold text-h6">Group operations</h3>
		<div>
			<TableActionButton
				tooltip="Delete all selected users"
				dialogTitle="User deletion"
				backdropColorEffect="rgb(255,0,0,0.1)"
				borderColorEffect="rgb(255,0,0)"
				isSubmittingDialog={isFetchingAction}
				onClickCallback={(modal) => {
					if (Object.keys(tableSelection).length > 0) {
						modal.showModal();
					}
				}}
			>
				<iconify-icon icon="fluent:delete-28-filled" class="z-10 text-3xl" />
				<div slot="dialog" let:modal={dialogRef}>
					<span>Are you sure you want to delete all selected users?</span>
					<div class="flex flex-wrap gap-2 mb-2">
						{#each Object.entries(tableSelection).map(([index, _]) => {
							return { name: tests[+index].title, id: tests[+index].id };
						}) as user, index}
							<span class="text-red-500">{user.name}</span>
							<span
								>{index !== Object.entries(tableSelection).length - 1
									? ','
									: ''}</span
							>
						{/each}
					</div>
					<SimpleButton>Cancel</SimpleButton>
					<SimpleButton
						class="hover:text-error dark:hover:text-dark_error"
						onClick={async () => {
							await deleteTestsFromDB();
							dialogRef.close();
						}}>Delete</SimpleButton
					>
				</div>
			</TableActionButton>
		</div>
	</div>
	<SearchBar
		bind:inputValue={searchInputValue}
		searchFunction={(value) => {
			searchInputValue = value;
			getNewTests(true, searchInputValue);
		}}
		class="w-fit"
	/>
</div>
<Table
	on:sorting-change={onTableSortChange}
	on:last-row-intersection={() => getNewTests(false)}
	bind:tableSelection
	bind:table
	{columns}
	isTableDisabled={isResetingTableValues}
	maxHeight={`calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - ${groupOperationsHeight}px - 2rem - 16px)`}
	data={tests.map((item) => {
		return {
			id: item.id,
			title: item.title ?? '',
			ownerName: item.owner.name,
			createdAt: transformDate(item.createdAt, { time: true })
		};
	})}
/>
