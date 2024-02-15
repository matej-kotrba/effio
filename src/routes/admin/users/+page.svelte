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

		if (reset) {
			users = newUsers;
		} else {
			users = [...users, ...newUsers];
		}

		console.log(users);
	}

	let addIntersectionUse: CreateObserverReturn['addIntersection'];

	onMount(() => {
		const { observer, addIntersection } = createObserver({
			callback: (entry, observer) => {
				if (entry.isIntersecting) {
					getNewUsers(false);

					observer.unobserve(entry.target);
				}
			}
		});
		addIntersectionUse = addIntersection;

		getNewUsers(false);

		return () => {
			observer.disconnect();
		};
	});
</script>

<Table
	data={users.map((item) => {
		return {
			id: item.id,
			name: item.name ?? '',
			role: item.role
		};
	})}
/>
