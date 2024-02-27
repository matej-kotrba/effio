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
		SortingState,
		Table as TableType
	} from '@tanstack/svelte-table';
	import type { Readable } from 'svelte/store';
	import { NONAUTHENTICATED_NAV_HEIGHT } from '~components/page-parts/Navbar.svelte';
	import { UserRoles } from '@prisma/client';
	import RowCheckBox from '~components/table/RowCheckBox.svelte';
	import * as DropdownMenu from '~/lib/components/ui/dropdown-menu';
	import SearchBar from '~components/inputs/SearchBar.svelte';

	const USERS_LIMIT = 20;

	type User = {
		id: string;
		name: string;
		role: UserRoles;
		provider: string;
		email: string;
	};

	const columns: ColumnDef<User>[] = [
		{
			id: 'select' as const,
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
			id: 'id' as const,
			accessorKey: 'id',
			header: 'ID',
			cell: (info) => info.getValue()
		},
		{
			id: 'provider' as const,
			accessorKey: 'provider',
			header: 'Provider',
			cell: (info) => info.getValue()
		},
		{
			id: 'name' as const,
			accessorKey: 'name',
			header: 'Name',
			cell: (info) => info.getValue()
		},
		{
			id: 'email' as const,
			accessorKey: 'email',
			header: 'Email',
			cell: (info) => info.getValue()
		},
		{
			id: 'role' as const,
			accessorKey: 'role',
			header: 'Role',
			cell: (info) => info.getValue()
		}
	];

	let searchInputValue: string = '';

	let users: Awaited<
		ReturnType<ReturnType<typeof trpc>['admin']['getUsersAdmin']['query']>
	> = [];

	let table: Readable<TableType<User>>;
	let groupOperationsHeight: number;

	let tableSelection: RowSelectionState = {};

	let isResetingTableValues: boolean = false;

	async function getNewUsers(
		reset: boolean = false,
		searchQuery?: string,
		sorting?: ColumnSort
	) {
		if (reset) {
			isResetingTableValues = true;
		}
		try {
			const newUsers = await trpc($page).admin.getUsersAdmin.query({
				limit: USERS_LIMIT,
				cursor: reset ? undefined : users[users.length - 1]?.id,
				searchQuery,
				order: sorting?.id || 'name',
				orderBy: sorting?.desc ? 'desc' : 'asc'
			});
			if (reset) {
				users = [];
			}
			users = [...users, ...newUsers];
		} catch (_) {
		} finally {
			isResetingTableValues = false;
		}
	}

	let isFetchingAction = false;

	async function deleteUsersFromDB() {
		isFetchingAction = true;
		const usersToDelete = Object.entries(tableSelection).map(([index, _]) => {
			return { name: users[+index].name, id: users[+index].id };
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
			users = users.filter((user) => {
				return !usersToDelete.some((userToDelete) => {
					return userToDelete.id === user.id;
				});
			});
			$table.resetRowSelection();

			toast.success(`Deleted ${deletedUsers} user(s)`);
		}
	}

	async function changeUserRole(
		userId: string,
		role: UserRoles,
		initialRole: UserRoles
	): Promise<boolean> {
		if (role === initialRole) {
			return true;
		}
		try {
			await trpc($page).admin.changeUserRole.mutate({
				userId,
				role
			});
			return true;
		} catch (e) {
			if (e instanceof TRPCClientError) {
				createTRPCErrorNotification(e);
			} else {
				toast.error('Unknown error occurred');
			}
			const user = users.find((user) => user.id === userId);
			if (user) {
				user.role = initialRole;
				users = users;
			}
			return false;
		}
	}

	function onTableSortChange(e: CustomEvent<ColumnSort[]>) {
		getNewUsers(true, searchInputValue, e.detail[0]);
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
							return { name: users[+index].name, id: users[+index].id };
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
							await deleteUsersFromDB();
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
			getNewUsers(true, searchInputValue);
		}}
		class="w-fit"
	/>
</div>
<Table
	on:sorting-change={onTableSortChange}
	on:last-row-intersection={() => getNewUsers(false, searchInputValue)}
	bind:tableSelection
	bind:table
	{columns}
	isTableDisabled={isResetingTableValues}
	maxHeight={`calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - ${groupOperationsHeight}px - 2rem - 16px)`}
	data={users.map((item) => {
		return {
			id: item.id,
			name: item.name ?? '',
			role: item.role,
			provider: item.accounts.map((account) => account.provider).join(', '),
			email: item.email || ''
		};
	})}
>
	<svelte:fragment slot="options" let:rowIndex>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger style="display: grid; place-content: center;"
				><iconify-icon
					icon="mi:options-vertical"
					class="text-3xl"
				/></DropdownMenu.Trigger
			>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label>Actions</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>User roles</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.RadioGroup bind:value={users[rowIndex].role}>
								{#each Object.values(UserRoles) as role}
									<DropdownMenu.RadioItem
										value={role}
										on:click={async (e) => {
											await changeUserRole(
												users[rowIndex].id,
												role,
												users[rowIndex].role
											);
										}}
										>{role[0].toUpperCase() +
											role.slice(1).toLowerCase()}</DropdownMenu.RadioItem
									>
								{/each}
							</DropdownMenu.RadioGroup>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</svelte:fragment>
</Table>
