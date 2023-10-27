<script lang="ts">
	import { onMount } from 'svelte';
	import { createObserver } from '~/lib/utils/observers';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import type { User } from '@prisma/client';

	export let data: {
		groupId: string;
	};

	let users: Pick<User, 'name' | 'id' | 'image'>[] = [];

	async function getUsers() {
		const result = await trpc($page).groups.getGroupUsers.query({
			groupId: data.groupId,
			cursor: users[users.length - 1] ? users[users.length - 1].id : undefined,
			limit: 10,
			select: {
				id: true,
				name: true,
				image: true
			}
		});
	}

	onMount(() => {
		createObserver({
			callback: (entry) => {
				if (entry.isIntersecting) {
				}
			}
		});
	});
</script>

{#each }