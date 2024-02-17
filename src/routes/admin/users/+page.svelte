<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import Table from '~components/table/Table.svelte';
	import {
		createObserver,
		type CreateObserverReturn
	} from '~/lib/utils/observers';

	const USERS_LIMIT = 20;

	let users: Awaited<
		ReturnType<ReturnType<typeof trpc>['admin']['getUsersAdmin']['query']>
	> = [];

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
	data={users.map((item) => {
		return {
			id: item.id,
			name: item.name ?? '',
			role: item.role
		};
	})}
>
	<div>
		<h3>Group operations</h3>
	</div>
</Table>
