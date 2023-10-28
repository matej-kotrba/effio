<script lang="ts">
	import { onMount } from 'svelte';
	import { createObserver } from '~/lib/utils/observers';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import type { User } from '@prisma/client';
	import type { CreateObserverReturn } from '~/lib/utils/observers';
	import { twMerge } from 'tailwind-merge';

	type UserDataObject = Pick<User, 'name' | 'id' | 'image'> & {
		takenCount: number;
	};

	export let data: {
		groupId: string;
		subcategorySlug: string;
		testId: string;
	};

	let classes = '';
	export { classes as class };

	let users: UserDataObject[] = [];
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

		const userTestCount = await trpc(
			$page
		).groups.getUsersTestRecordCount.query({
			subcategorySlug: data.subcategorySlug,
			testId: data.testId,
			userId: result.map((item) => item.id)
		});

		const joinedArray: UserDataObject[] = result
			.map((item) => {
				const count = userTestCount.find(
					(countItem) => countItem.userId === item.id
				);
				if (!count)
					return {
						id: item.id,
						name: item.name,
						image: item.image,
						takenCount: 0
					};
				return {
					id: item.id,
					name: item.name,
					image: item.image,
					takenCount: count._count.id
				} as UserDataObject;
			})
			.filter((item) => item !== undefined) as UserDataObject[];

		users = [...users, ...joinedArray];
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

<div class={twMerge('grid grid-cols-12', classes)}>
	<div class="grid grid-cols-12 col-span-12">
		<span class="col-span-3 font-bold text-center text-body1">Name</span>
		<span class="col-span-1 font-bold text-center text-body1">Icon</span>
		<span class="col-span-1 font-bold text-center text-body1">Taken</span>
		<span class="col-span-2 font-bold text-center text-body1">Taken Count</span>
	</div>
	{#each users as user, index}
		<div
			use:addIntersectionUse={{ shouldActive: index === users.length - 1 }}
			class="grid w-full grid-cols-12 col-span-12 px-2 py-2 bg-light_whiter text-light_text_black"
		>
			<span class="col-span-3 font-semibold text-center">{user.name}</span>
			<img
				class="col-span-1 font-semibold text-center"
				src={user.image}
				alt="User"
			/>
			<span class="col-span-1 font-semibold text-center">{user.takenCount}</span
			>
			<span class="col-span-2 font-semibold text-center">{user.takenCount}</span
			>
		</div>
	{/each}
</div>
