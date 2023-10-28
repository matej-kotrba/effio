<script lang="ts">
	import { onMount } from 'svelte';
	import { createObserver } from '~/lib/utils/observers';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import type { User } from '@prisma/client';
	import type { CreateObserverReturn } from '~/lib/utils/observers';
	import { twMerge } from 'tailwind-merge';

	export let data: {
		groupId: string;
	};

	let classes = '';
	export { classes as class };

	let users: Pick<User, 'name' | 'id' | 'image'>[] = [];
	let isFetchingNewUsers = true;

	async function getUsers() {
		const result = await trpc($page).groups.getGroupUsers.query({
			groupId: data.groupId,
			cursor: users[users.length - 1] ? users[users.length - 1].id : undefined,
			limit: 12,
			select: {
				id: true,
				name: true,
				image: true
			}
		});

		users = [...users, ...result];
	}

	let addIntersectionUse: CreateObserverReturn['addIntersection'];

	onMount(() => {
		const { addIntersection, observer } = createObserver({
			callback: (entry, observer) => {
				if (entry.isIntersecting) {
					getUsers();

					observer.unobserve(entry.target);
				}
			}
		});
		addIntersectionUse = addIntersection;

		getUsers();

		return () => {
			observer.disconnect();
		};
	});
</script>

<div class={twMerge('flex flex-col gap-1', classes)}>
	{#each users as user, index}
		<div
			use:addIntersectionUse={{ shouldActive: index === users.length - 1 }}
			class="w-full rounded-md h-[200px] bg-light_whiter text-light_text_black"
		>
			{user.name}
		</div>
	{/each}
</div>
