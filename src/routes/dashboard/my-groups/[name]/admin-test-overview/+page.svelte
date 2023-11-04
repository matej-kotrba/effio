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

	export let data;

	type Test =
		| {
				id: string;
				title: string;
				description: string;
				takenByPeopleCount: number;
				img?: string;
		  }[];

	type TestOrFetching = Test | undefined;

	let tests: TestOrFetching[] = data['group']['groupsSubcategories'].map(
		() => undefined
	);

	async function setTestForSubcategory(id: string, index: number) {
		const testsData = await trpc(
			$page
		).groups.getSubcategoryTestsByIdWithRecords.query({
			id: id,
			excludeOwnersRecords: true
		});

		tests[index] = testsData.map((test) => {
			return {
				id: test.test.id,
				title: test.test.title,
				description: test.test.description,
				takenByPeopleCount: test.test.testVersions[0]._count.records
			};
		});
	}

	// DIALOG
	let selectedUsers: UserDataObject[] = [];
	let kickDialogOpen: () => void;
	let kickDialogClose: () => void;
</script>

<Dialog
	bind:open={kickDialogOpen}
	bind:close={kickDialogClose}
	title={'Are you sure you want to kick these users from the group?'}
	titleClasses="text-center"
>
	<form action="?/deleteUsers" method="POST">
		<Space gap={10} />
		<p class="text-center text-h6">
			{#each selectedUsers as user, index}
				<span class="font-semibold text-error dark:text-dark_error"
					>{user.name}</span
				>
				{#if index !== selectedUsers.length - 1}
					{' '},{' '}
				{/if}
			{/each}
		</p>
		<Space gap={10} />
		<div class="flex items-center justify-center gap-4">
			<button type="button" class="btn btn-outline">Cancel</button>
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
</div>
