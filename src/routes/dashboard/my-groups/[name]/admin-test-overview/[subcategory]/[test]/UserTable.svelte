<script lang="ts">
	import { onMount } from 'svelte';
	import { createObserver } from '~/lib/utils/observers';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import type { User } from '@prisma/client';
	import type { CreateObserverReturn } from '~/lib/utils/observers';
	import { twMerge } from 'tailwind-merge';
	import { userOrAnonymousSrc } from '~/lib/utils/icons';
	import Separator from '~components/separators/Separator.svelte';
	import { applicationStates } from '~stores/applicationStates';

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

<div
	class={twMerge(
		'grid grid-cols-12 max-w-[800px] max-h-[400px] overflow-y-scroll',
		classes
	)}
>
	<div class="grid grid-cols-7 col-span-12">
		<span class="col-span-3 font-semibold text-center text-body1">Name</span>
		<span class="col-span-1 font-semibold text-center text-body1">Icon</span>
		<span class="col-span-1 font-semibold text-center text-body1">Taken</span>
		<span class="col-span-2 font-semibold text-center text-body1"
			>Taken Count</span
		>
	</div>
	{#each users as user, index}
		<div
			use:addIntersectionUse={{ shouldActive: index === users.length - 1 }}
			class="grid items-center w-full grid-cols-7 col-span-12 px-2 py-2 bg-light_whiter hover:bg-light_grey text-light_text_black"
		>
			<span class="col-span-3 font-semibold text-center">{user.name}</span>
			<div class="flex justify-center col-span-1 text-center">
				<img
					class="w-8 font-semibold rounded-full aspect-square text-light_text_black dark:text-dark_text_white"
					src={userOrAnonymousSrc(user.image)}
					alt="User"
				/>
			</div>
			<span class="col-span-1 font-semibold text-center">{user.takenCount}</span
			>
			<span class="col-span-2 font-semibold text-center">{user.takenCount}</span
			>
		</div>
		{#if index !== users.length - 1}
			<Separator
				w="100%"
				h="1px"
				class={$applicationStates.darkMode.isDarkMode
					? 'var(--dark-text-white-20) col-span-12'
					: 'var(--light-text-black-20) col-span-12'}
			/>
		{/if}
	{/each}
</div>
