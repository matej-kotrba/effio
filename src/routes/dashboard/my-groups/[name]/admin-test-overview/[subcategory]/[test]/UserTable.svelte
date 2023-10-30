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

	type Ordering = {
		by: 'name' | 'count';
		order: 'asc' | 'desc';
	};

	export let data: {
		groupId: string;
		subcategorySlug: string;
		testId: string;
	};

	let classes = '';
	export { classes as class };

	let users: UserDataObject[] = [];
	let isFetchingNewUsers = false;
	let isFetchingBlank = true;

	let ordering: Ordering = {
		by: 'count',
		order: 'desc'
	};

	function createOrderSwap(by: Ordering['by']) {
		let initialOrder: Ordering['order'];

		switch (by) {
			case 'name': {
				initialOrder = 'asc';
				break;
			}
			case 'count': {
				initialOrder = 'desc';
				break;
			}
		}

		return () => {
			swapOrdering(
				by,
				ordering.by === by
					? ordering.order === 'desc'
						? 'asc'
						: 'desc'
					: initialOrder
			);
		};
	}

	function swapOrdering(by: Ordering['by'], order: Ordering['order']) {
		ordering = {
			by,
			order
		};

		getUsers(true);
	}

	async function getUsers(shouldReset: boolean = false) {
		if (shouldReset === true) {
			isFetchingBlank = true;
		} else {
			isFetchingNewUsers = true;
		}
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const result = await trpc($page).groups.getGroupUsers.query({
			groupId: data.groupId,
			testId: data.testId,
			subcategorySlug: data.subcategorySlug,
			ordering: ordering,
			cursor:
				shouldReset === false && users[users.length - 1]
					? users[users.length - 1].id
					: undefined,
			limit: 12,
			select: {
				id: true,
				name: true,
				image: true
			}
		});
		if (shouldReset === true) {
			isFetchingBlank = false;
		} else {
			isFetchingNewUsers = false;
		}

		if (shouldReset) users = [];

		const transformedArray: UserDataObject[] = result.map((item) => {
			return {
				id: item.id,
				image: item.image,
				name: item.name,
				takenCount: item._count.testRecords
			};
		});

		users = [...users, ...transformedArray];
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

		getUsers(true);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div
	class={twMerge(
		'grid grid-cols-12 max-w-[800px] h-[400px] max-h-[800px] shadow-md bg-light_whiter',
		classes
	)}
>
	<div
		class="grid grid-cols-7 col-span-12 py-1 bg-light_whiter rounded-t-md h-fit"
	>
		<div class="relative flex justify-center col-span-3 h-fit">
			<button
				type="button"
				on:click={() => createOrderSwap('name')()}
				class="font-semibold text-center text-body1">Name</button
			>
			{#if ordering.by === 'name'}
				<iconify-icon
					icon="iconamoon:arrow-down-2"
					class={`absolute right-0 text-2xl -translate-y-1/2 top-1/2 text-light_text_black dark:text-dark_text_white ${
						ordering.order === 'asc' ? 'rotate-180' : ''
					}`}
				/>
			{/if}
		</div>
		<span class="col-span-1 font-semibold text-center text-body1 h-fit"
			>Icon</span
		>
		<span class="col-span-1 font-semibold text-center text-body1 h-fit"
			>Taken</span
		>
		<div class="relative flex justify-center col-span-2 h-fit">
			<button
				type="button"
				class="col-span-2 font-semibold text-center text-body1"
				on:click={() => createOrderSwap('count')()}>Taken Count</button
			>
			{#if ordering.by === 'count'}
				<iconify-icon
					icon="iconamoon:arrow-down-2"
					class={`absolute right-0 text-2xl -translate-y-1/2 top-1/2 text-light_text_black dark:text-dark_text_white ${
						ordering.order === 'asc' ? 'rotate-180' : ''
					}`}
				/>
			{/if}
		</div>
	</div>
	<div class="grid grid-cols-7 col-span-12 overflow-y-scroll bg-light_whiter">
		{#if isFetchingBlank && users.length === 0}
			<div class="flex justify-center col-span-7">
				<span class="loading loading-bars loading-lg" />
			</div>
		{:else}
			{#each users as user, index}
				<div
					use:addIntersectionUse={{ shouldActive: index === users.length - 1 }}
					class={`grid items-center w-full grid-cols-7 col-span-12 px-2 py-2 bg-light_whiter hover:bg-light_grey text-light_text_black ${
						isFetchingBlank ? 'opacity-40' : ''
					}`}
				>
					<span class="col-span-3 font-normal text-center">{user.name}</span>
					<div class="flex justify-center col-span-1 text-center">
						<img
							class="w-8 font-normal rounded-full aspect-square text-light_text_black dark:text-dark_text_white"
							src={userOrAnonymousSrc(user.image)}
							alt="User"
						/>
					</div>
					<div
						class="grid col-span-1 font-normal text-center place-content-center"
					>
						{#if user.takenCount > 0}
							<iconify-icon
								icon="ic:round-check"
								class="text-2xl text-green-500"
							/>
						{:else}
							<iconify-icon icon="ic:round-close" class="text-2xl text-error" />
						{/if}
					</div>
					<span class="col-span-2 font-normal text-center"
						>{user.takenCount}</span
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
		{/if}
	</div>
</div>
