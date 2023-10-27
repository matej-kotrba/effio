<script lang="ts">
	import { onMount } from 'svelte';
	import { createObserver } from '~/lib/utils/observers';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';

	export let data: {
		groupId: string;
	};

	let users = [];

	async function getUsers() {
		const result = await trpc($page).groups.getGroupUsers.query({
			groupId: data.groupId,
			cursor: users[users.length - 1]
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
