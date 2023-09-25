<script lang="ts">
	import { testObject } from '~stores/testObject';
	import { page } from '$app/stores';
	import type { Group, GroupOnTests } from '@prisma/client';
	import { trpc } from '~/lib/trpc/client';

	export let groupData: GroupOnTests[];

	let groups: Group[] | 'fetching' = 'fetching';
	let checkboxGroup: (string | 'public')[] = ['public'];

	async function onInitialGroupDisplay() {
		const userGroups = await trpc($page).groups.getGroupsByUserId.query({
			alsoUser: false
		});
		groups = userGroups;
		checkboxGroup = ['public', ...groupData.map((item) => '#' + item.groupId)];
		console.log(checkboxGroup);
	}

	$: $testObject.includedInGroups = checkboxGroup.map((item) =>
		item.replace('#', '')
	);
</script>

<div class="dropdown dropdown-end dropdown-bottom">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label tabindex="0" class="m-1 btn" on:click|once={onInitialGroupDisplay}
		>Group Selection</label
	>
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<ul
		tabindex="0"
		class="p-2 shadow-md menu dropdown-content z-[100] bg-light_whiter w-52 min-h-[80px] relative rounded-sm"
	>
		{#if typeof groups !== 'string'}
			<div class="mb-1 grid-input__container">
				<label for="public">Public</label>
				<input
					type="checkbox"
					bind:group={checkboxGroup}
					class="checkbox checkbox-primary dark:checkbox-accent"
					value="public"
					name="public"
				/>
			</div>
			<!-- # before value is for case when a value would be named 'public' -->
			{#each groups as group}
				<div class="mb-1 grid-input__container">
					<label for={group.slug}>{group.name}</label>
					<input
						type="checkbox"
						bind:group={checkboxGroup}
						class="checkbox checkbox-primary dark:checkbox-accent"
						value="#{group.id}"
						name={group.slug}
					/>
				</div>
			{/each}
		{:else if groups === 'fetching'}
			<div class="absolute inset-0 grid place-content-center">
				<span
					class="loading loading-spinner loading-md text-light_primary dark:text-dark_primary"
				/>
			</div>
		{/if}
	</ul>
</div>

<style>
	.grid-input__container {
		display: grid;
		grid-template-columns: 1fr auto;
	}
</style>
