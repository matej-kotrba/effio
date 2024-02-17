<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import Table from '~components/table/Table.svelte';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers';
	import TableActionButton from './TableActionButton.svelte';
	import type { RowSelectionState } from '@tanstack/svelte-table';

	const USERS_LIMIT = 20;

	let users: Awaited<
		ReturnType<ReturnType<typeof trpc>['admin']['getUsersAdmin']['query']>
	> = [];

	let tableSelection: RowSelectionState = {};

	async function getNewUsers(reset: boolean = false) {
		const newUsers = await trpc($page).admin.getUsersAdmin.query({
			limit: USERS_LIMIT,
			cursor: users[users.length - 1]?.id
		});
		console.log(newUsers);
		if (reset) {
			users = newUsers;
		} else {
			users = [...users, ...newUsers];
		}
	}
</script>

<Table
	on:last-row-intersection={() => getNewUsers(false)}
	bind:tableSelection
	data={users.map((item) => {
		return {
			id: item.id,
			name: item.name ?? '',
			role: item.role
		};
	})}
>
	<div>
		<h3 class="font-semibold text-h6">Group operations</h3>
		<div>
			<TableActionButton
				tooltip="Delete all selected users"
				dialogTitle="User deletion"
				backdropColorEffect="rgb(255,0,0,0.1)"
				borderColorEffect="rgb(255,0,0)"
			>
				<iconify-icon icon="fluent:delete-28-filled" class="z-10 text-3xl" />
				<div slot="dialog">
					<span>Are you sure you want to delete all selected users?</span>
					<div class="flex flex-wrap gap-2">
						{#each Object.entries(tableSelection).map(([index, _]) => {
							return { name: users[+index].name };
						}) as user, index}
							<span class="text-red-500">{user.name}</span>
							<span
								>{index !== Object.entries(tableSelection).length - 1
									? ','
									: ''}</span
							>
						{/each}
					</div>
				</div>
			</TableActionButton>
		</div>
	</div>
</Table>
