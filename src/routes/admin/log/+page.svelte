<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import Table, { type User } from '~components/table/Table.svelte';
	import type { RowSelectionState } from '@tanstack/svelte-table';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import toast from 'svelte-french-toast';
	import { createTRPCErrorNotification } from '~/lib/utils/notification';
	import { TRPCClientError } from '@trpc/client';
	import type { Table as TableType } from '@tanstack/svelte-table';
	import type { Readable } from 'svelte/store';

	const USERS_LIMIT = 20;

	let users: Awaited<
		ReturnType<ReturnType<typeof trpc>['admin']['getUsersAdmin']['query']>
	> = [];

	let table: Readable<TableType<User>>;

	let tableSelection: RowSelectionState = {};

	async function getNewUsers(reset: boolean = false) {
		const newUsers = await trpc($page).admin.getUsersAdmin.query({
			limit: USERS_LIMIT,
			cursor: users[users.length - 1]?.id
		});
		if (reset) {
			users = newUsers;
		} else {
			users = [...users, ...newUsers];
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
</script>

<Table
	on:last-row-intersection={() => getNewUsers(false)}
	bind:tableSelection
	bind:table
	data={users.map((item) => {
		return {
			id: item.id,
			name: item.name ?? '',
			role: item.role
		};
	})}
/>
