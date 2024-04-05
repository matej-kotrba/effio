<script lang="ts">
	import { trpc } from '~/lib/trpc/client.js';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import { page } from '$app/stores';
	import TestImageCard from '~components/containers/card/TestImageCard.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import UserTable from './[subcategory]/[test]/UserTable.svelte';
	import type { UserDataObject } from './[subcategory]/[test]/UserTable.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import Space from '~components/separators/Space.svelte';
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import TestOverviewCard from './TestOverviewCard.svelte';
	import { onMount } from 'svelte';
	import SkeletonLine from '~components/informatic/SkeletonLine.svelte';

	export let data;
	export let form;

	type Test =
		| {
				id: string;
				title: string;
				description: string;
				takenByPeopleCount: number;
				takenByUniquePeopleCount: number;
				addedAt: Date;
				img?: string;
		  }[];

	type TestOrFetching = Test | undefined;

	let tests: TestOrFetching[] = data['group']['groupsSubcategories'].map(
		() => undefined
	);
	let isCollapsed: boolean[] = Array(
		data['group']['groupsSubcategories'].length
	).fill(false);

	async function setTestForSubcategory(id: string, index: number) {
		const testsData = await trpc(
			$page
		).groups.getSubcategoryTestsByIdWithRecords.query({
			id: id,
			orderByDate: 'desc'
		});

		tests[index] = testsData.map((test) => {
			return {
				id: test.test.id,
				title: test.test.title,
				description: test.test.description,
				takenByPeopleCount: test.test.testVersions[0]._count.records,
				takenByUniquePeopleCount: test.uniqueUsersCount,
				addedAt: test.addedDate,
				img: test.test.imageUrl
			};
		});
	}

	function collapseChannelTests(index: number) {
		const collapsible = document.querySelectorAll('.collapsible')[index];
		collapsible.classList.toggle('collapsed');
		isCollapsed[index] = collapsible.classList.contains('collapsed');
	}

	onMount(() => {
		data.group.groupsSubcategories.forEach((item, index) => {
			setTestForSubcategory(item.id, index);
		});
	});
</script>

<div class="p-4">
	{#each data['group']['groupsSubcategories'] as channel, index}
		{@const testArray = tests[index]}
		<div class="flex flex-wrap justify-between">
			<h4 class="text-h5">{channel.name}</h4>
			<button
				type="button"
				class="grid p-2 duration-100 rounded-lg hover:bg-light_grey dark:hover:bg-dark_light_grey place-content-center"
				on:click={() => collapseChannelTests(index)}
			>
				<iconify-icon
					icon="iconamoon:arrow-down-2-duotone"
					class="text-3xl duration-100 {isCollapsed[index]
						? 'rotate-180'
						: 'rotate-0'}"
				/>
			</button>
		</div>
		<Space gap={4} />
		<Separator w={'100%'} h={'1px'} />
		<Space gap={8} />
		<div class="collapsible">
			<div>
				{#if testArray === undefined}
					<div class="flex flex-col gap-1">
						<SkeletonLine class="w-32 h-8 mx-0" />
						<SkeletonLine class="w-full h-1 mx-0" />
						<div class="grid__container">
							<SkeletonLine class="w-full h-auto aspect-[3/2] mx-0" />
							<SkeletonLine class="w-full h-auto aspect-[3/2] mx-0" />
							<SkeletonLine class="w-full h-auto aspect-[3/2] mx-0" />
						</div>
					</div>
				{:else if testArray.length === 0}
					<div
						class="mx-auto w-fit aspect-[3/2] flex flex-col gap-2 items-center justify-center"
					>
						<iconify-icon
							icon="ep:folder-opened"
							class="grid mx-auto text-5xl place-content-center text-light_text_black_60"
						/>
						<p class="text-h6 text-light_text_black_80">
							There is no test in the channel
						</p>
					</div>
				{:else}
					<div class="grid__container">
						{#each testArray as test}
							<div>
								<TestOverviewCard
									data={{
										name: test.title,
										addedAt: test.addedAt,
										imageUrl: test.img,
										doneBy: test.takenByUniquePeopleCount,
										totalNumberOfUsers: data.group.users.length - 1,
										link: `admin-test-overview/${channel.slug}/${test.id}`
									}}
								/>
								<Space gap={16} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<!-- <Dialog
	bind:open={kickDialogOpen}
	bind:close={kickDialogClose}
	title={'Are you sure you want to kick these users from the group?'}
	titleClasses="text-center"
>
	<form
		action="?/deleteUsers"
		method="POST"
		use:enhance={() => {
			return async ({ result, update }) => {
				update();
				if (result['status'] === 200) {
					toast.success('Users were removed from the group successfuly.');
					revalidateUsers();
				} else if (result['type'] === 'failure') {
					toast.error(form?.message || 'Something went wrong.');
				}
				kickDialogClose();
			};
		}}
	>
		<Space gap={10} />
		<p class="text-center text-h6">
			{#each selectedUsers as user, index}
				<span class="font-semibold text-error dark:text-dark_error"
					>{user.name}</span
				>
				<input type="hidden" readonly value={user.id} name={'' + index} />
				{#if index !== selectedUsers.length - 1}
					{' '},{' '}
				{/if}
			{/each}
		</p>
		<Space gap={10} />
		<div class="flex items-center justify-center gap-4">
			<button type="button" class="btn btn-outline" on:click={kickDialogClose}
				>Cancel</button
			>
			<button type="submit" class="text-white btn bg-error hover:bg-dark_error"
				>Delete</button
			>
		</div>
	</form>
</Dialog>
<div class="@container px-4">
	<div class="grid @6xl:grid-cols-2 grid-cols-1">
		<section class="relative p-2">
			<div class="mb-4">
				<h5 class="font-semibold text-h5">Group tests</h5>
				<Separator w="100%" h="1px" />
			</div>
			<div class="max-w-[600px]">
				{#each data['group']['groupsSubcategories'] as subcategory, index}
					<Collapsible
						title={subcategory.name}
						class="w-full bg-light_grey"
						buttonClasses="bg-light_grey_dark"
						onOpen={() => setTestForSubcategory(subcategory.id, index)}
					>
						{@const testArray = tests[index]}
						{#if testArray === undefined}
							<div class="flex justify-center">
								<span class="loading loading-bars loading-lg" />
							</div>
						{:else if testArray.length === 0}
							<div class="flex justify-center">
								<span class="text-h6">Sorry, No tests found</span>
							</div>
						{:else}
							<div class="grid w-full grid-cols-2 gap-1">
								{#each testArray as testInitial}
									<div class="relative">
										<div
											class="flex gap-1 p-1 items-center absolute right-2 top-2 shadow-sm dark:shadow-white bg-light_quaternary text-light_text_black dark:bg-dark_quaternary dark:text-dark_text_white z-[5] w-fit whitespace-nowrap rounded-lg"
										>
											<span class="text-body3">Taken by:</span>
											<span class="text-body2"
												>{testInitial.takenByPeopleCount}</span
											>
										</div>
										<TestImageCard
											test={{
												title: testInitial.title,
												description: 'See the statistics'
											}}
											url={`/dashboard/my-groups/${data['group']['slug']}/admin-test-overview/${subcategory.slug}/${testInitial.id}`}
										/>
									</div>
								{/each}
							</div>
						{/if}
					</Collapsible>
				{/each}
			</div>
		</section>
		<section class="p-2">
			<div class="mb-4">
				<h5 class="font-semibold text-h5">Group Users</h5>
				<Separator w="100%" h="1px" />
			</div>
			<UserTable
				bind:revalidateUsers
				bind:selectedUsers
				ownerId={data.group.ownerId}
				actions={[
					{
						icon: 'fluent:delete-28-filled',
						tooltip: selectedUsers
							.map((user) => user.id)
							.includes(data.group.ownerId)
							? 'You cannot kick owner from the group.'
							: 'Kick user(s) from the group',
						onClick: () => {
							if (selectedUsers.length === 0) return;
							kickDialogOpen();
						},
						buttonAttr: {
							disabled:
								selectedUsers.length === 0 ||
								selectedUsers
									.map((user) => user.id)
									.includes(data.group.ownerId)
						}
					}
				]}
				data={{
					groupId: data.group.id
				}}
				displayData={{
					image: true,
					joinedAt: true,
					role: true,
					checkbox: true
				}}
				defaultOrderBy="name"
			/>
		</section>
	</div>
</div> -->

<style>
	.grid__container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
	}

	.collapsible {
		display: grid;
		grid-template-rows: 1fr;
		transition: grid-template-rows 0.3s ease;
	}

	.collapsible > div {
		overflow: hidden;
	}

	.collapsible:global(.collapsed) {
		grid-template-rows: 0fr;
	}
</style>
