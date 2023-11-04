<script lang="ts" context="module">
	export type UserDataObject = Pick<Partial<User>, 'name' | 'id' | 'image'> & {
		takenCount?: number;
		joinedAt?: Date;
	};
</script>

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
	import { transformDate } from '~/lib/utils/date';
	import { TRPCClientError } from '@trpc/client';
	import IconButton from '~components/buttons/IconButton.svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Ordering = {
		by: 'name' | 'count';
		order: 'asc' | 'desc';
	};

	type DisplayData = {
		image: boolean;
		taken: boolean;
		takenCount: boolean;
		joinedAt: boolean;
		role: boolean;
		checkbox: boolean;
	};

	type AlwaysDisplayedData = {
		name: boolean;
	};

	const DATA_GRID_COLUMNS: {
		[Key in keyof DisplayData as Key]: number;
	} & {
		[Key in keyof AlwaysDisplayedData as Key]: number;
	} = {
		name: 4,
		image: 1,
		taken: 1,
		takenCount: 2,
		joinedAt: 3,
		checkbox: 1,
		role: 1
	};

	export let data: {
		groupId: string;
		subcategorySlug?: string;
		testId?: string;
	};

	export let displayData: Partial<DisplayData>;
	export let defaultOrderBy: Ordering['by'] = 'count';
	export let ownerId: string;

	export let actions: {
		tooltip: string;
		icon: string;
		buttonAttr?: HTMLButtonAttributes;
		onClick: () => void;
	}[] = [];

	let alwaysDisplayData: AlwaysDisplayedData = {
		name: true
	};

	let classes = '';
	export { classes as class };

	let users: UserDataObject[] = [];
	let isFetchingNewUsers = false;
	let isFetchingBlank = true;

	let ordering: Ordering = {
		by: defaultOrderBy,
		order: 'desc'
	};

	let error = {
		is: false,
		message: ''
	};

	export let selectedUsers: UserDataObject[] = [];

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

	function calculateGridColumnCount() {
		let count = 0;

		for (const key in displayData) {
			if (displayData[key as keyof DisplayData]) {
				count += DATA_GRID_COLUMNS[key as keyof DisplayData];
			}
		}

		for (const key in alwaysDisplayData) {
			if (alwaysDisplayData[key as keyof AlwaysDisplayedData]) {
				count += DATA_GRID_COLUMNS[key as keyof AlwaysDisplayedData];
			}
		}

		return count;
	}

	async function getUsers(shouldReset: boolean = false) {
		if (shouldReset === true) {
			isFetchingBlank = true;
		} else {
			isFetchingNewUsers = true;
		}

		let result;
		try {
			result = await trpc($page).groups.getGroupUsers.query({
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
					name: !!alwaysDisplayData.name,
					image: !!displayData.image,
					count: !!displayData.takenCount,
					joinedAt: !!displayData.joinedAt
				}
			});
		} catch (e) {
			if (e instanceof TRPCClientError) {
				error.is = true;
				error.message = e.message;
			} else {
				error.is = true;
				error.message = 'An error has occured';
			}
		}
		if (!result) {
			isFetchingNewUsers = false;
			isFetchingBlank = false;
			return;
		}

		if (shouldReset === true) {
			isFetchingBlank = false;
		} else {
			isFetchingNewUsers = false;
		}

		if (shouldReset) users = [];

		const transformedArray: UserDataObject[] = result.map((item) => {
			return {
				id: item.id,
				image: displayData.image ? item.image : undefined,
				name: alwaysDisplayData.name ? item.name : undefined,
				takenCount:
					displayData.takenCount || displayData.taken
						? item._count.testRecords
						: undefined,
				joinedAt: displayData.joinedAt ? item.groups[0].joinedAt : undefined
			} satisfies Record<keyof typeof displayData & { id: string }, unknown>;
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
		'overflow-x-auto max-w-[800px] h-[400px] max-h-[800px] rounded-md shadow-md bg-light_whiter dark:bg-dark_light_grey',
		classes
	)}
>
	<div class="flex items-center w-full p-1">
		{#each actions as action}
			<IconButton
				icon={action.icon}
				buttonClasses="text-2xl"
				tootlip={action.tooltip}
				attr={action.buttonAttr}
				onClick={action.onClick}
			/>
		{/each}
	</div>
	<div
		style={`grid-template-columns: repeat(${calculateGridColumnCount()}, 1fr);`}
		class="grid col-span-12 py-1 border-b-2 border-solid bg-light_whiter dark:bg-dark_light_grey rounded-t-md h-fit border-light_text_black_40 dark:border-dark_text_white_40"
	>
		{#if displayData.checkbox}
			<span style={`grid-column: span ${DATA_GRID_COLUMNS['checkbox']};`} />
		{/if}
		{#if alwaysDisplayData.name}
			<div
				style={`grid-column: span ${DATA_GRID_COLUMNS['name']};`}
				class="relative flex justify-center h-fit"
			>
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
		{/if}
		{#if displayData.role}
			<span
				style={`grid-column: span ${DATA_GRID_COLUMNS['role']};`}
				class="font-semibold text-center text-body1 h-fit">Role</span
			>
		{/if}
		{#if displayData.image}
			<span
				style={`grid-column: span ${DATA_GRID_COLUMNS['image']};`}
				class="font-semibold text-center text-body1 h-fit">Icon</span
			>
		{/if}
		{#if displayData.taken}
			<span
				style={`grid-column: span ${DATA_GRID_COLUMNS['taken']};`}
				class="font-semibold text-center text-body1 h-fit">Taken</span
			>
		{/if}
		{#if displayData.takenCount}
			<div
				style={`grid-column: span ${DATA_GRID_COLUMNS['takenCount']};`}
				class="relative flex justify-center h-fit"
			>
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
		{/if}
		{#if displayData.joinedAt}
			<span
				style={`grid-column: span ${DATA_GRID_COLUMNS['joinedAt']};`}
				class="font-semibold text-center text-body1 h-fit">Joined At</span
			>
		{/if}
	</div>
	<div
		style={`grid-template-columns: repeat(${calculateGridColumnCount()}, 1fr);`}
		class="relative grid col-span-12 overflow-y-scroll bg-light_whiter dark:bg-dark_light_grey"
	>
		{#if isFetchingBlank && users.length === 0}
			<div
				class="flex justify-center"
				style={`grid-column: span ${calculateGridColumnCount()};`}
			>
				<span class="loading loading-bars loading-lg" />
			</div>
		{:else if error.is}
			<div
				class="flex flex-col items-center justify-center w-full text-center"
				style={`grid-column: span ${calculateGridColumnCount()};`}
			>
				<iconify-icon
					icon="solar:mask-sad-linear"
					class="text-6xl text-light_text_black_20 dark:text-dark_text_white_20"
				/>
				{error.message}
			</div>
		{:else}
			{#each users as user, index}
				<div
					use:addIntersectionUse={{ shouldActive: index === users.length - 1 }}
					style={`grid-template-columns: repeat(${calculateGridColumnCount()}, 1fr);`}
					class={`grid items-center w-full col-span-12 px-2 py-2 bg-light_whiter dark:bg-dark_light_grey hover:bg-light_grey text-light_text_black dark:text-dark_text_white ${
						isFetchingBlank ? 'opacity-40' : ''
					}`}
				>
					{#if displayData.checkbox}
						<div
							style={`grid-column: span ${DATA_GRID_COLUMNS['checkbox']};`}
							class="grid font-normal text-center place-content-center"
						>
							<input
								type="checkbox"
								bind:group={selectedUsers}
								value={user}
								class="checkbox checkbox-primary dark:checkbox-accent"
							/>
						</div>
					{/if}
					{#if alwaysDisplayData.name}
						<span
							style={`grid-column: span ${DATA_GRID_COLUMNS['name']};`}
							class="font-normal text-center">{user.name}</span
						>
					{/if}
					{#if displayData.role}
						<span
							style={`grid-column: span ${DATA_GRID_COLUMNS['role']};`}
							class="font-normal text-center"
							>{user.id === ownerId ? 'Owner' : 'User'}</span
						>
					{/if}
					{#if displayData.image}
						<div
							style={`grid-column: span ${DATA_GRID_COLUMNS['image']};`}
							class="flex justify-center text-center"
						>
							<img
								class="w-8 font-normal rounded-full aspect-square text-light_text_black dark:text-dark_text_white"
								src={userOrAnonymousSrc(user.image)}
								alt="User"
							/>
						</div>
					{/if}
					{#if displayData.taken}
						<div
							style={`grid-column: span ${DATA_GRID_COLUMNS['taken']};`}
							class="grid font-normal text-center place-content-center"
						>
							{#if user.takenCount && user.takenCount > 0}
								<iconify-icon
									icon="ic:round-check"
									class="text-2xl text-green-500"
								/>
							{:else}
								<iconify-icon
									icon="ic:round-close"
									class="text-2xl text-error"
								/>
							{/if}
						</div>
					{/if}
					{#if displayData.takenCount}
						<span
							style={`grid-column: span ${DATA_GRID_COLUMNS['takenCount']};`}
							class="font-normal text-center">{user.takenCount}</span
						>
					{/if}
					{#if displayData.joinedAt}
						{#if user.joinedAt}
							<span
								style={`grid-column: span ${DATA_GRID_COLUMNS['joinedAt']};`}
								class="font-normal text-center"
								>{transformDate(user.joinedAt, { time: true })}</span
							>
						{:else}
							Unknown
						{/if}
					{/if}
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
