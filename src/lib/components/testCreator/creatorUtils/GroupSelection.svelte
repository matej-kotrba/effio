<script lang="ts">
	import { page } from '$app/stores';
	import type { Group } from '@prisma/client';
	import { trpc } from '~/lib/trpc/client';
	import Skewed from '~components/loaders/Skewed.svelte';

	let groups: Group[] | 'fetching' = 'fetching';
	let checkboxGroup: string[] = [];

	async function onInitialGroupDisplay() {
		const userGroups = await trpc($page).groups.getGroupsByUserId.query({
			alsoUser: false
		});
		groups = userGroups;
	}
</script>

<details class="mb-32 dropdown">
	<summary class="m-1 btn" on:click|once={onInitialGroupDisplay}
		>Group Selection</summary
	>
	<ul
		class="p-2 shadow menu dropdown-content z-[100] bg-base-100 w-52 min-h-[80px] relative"
	>
		{#if typeof groups !== 'string'}
			<input
				type="checkbox"
				bind:group={checkboxGroup}
				class="checkbox"
				value="public"
			/>
			{#each groups as group}
				<input
					type="checkbox"
					bind:group={checkboxGroup}
					class="checkbox"
					value={group.slug}
				/>
			{/each}
		{:else if groups === 'fetching'}
			<div class="absolute inset-0 grid place-content-center">
				<span
					class="loading loading-spinner loading-md text-light_primary dark:text-dark_primary"
				/>
			</div>
		{/if}
	</ul>
</details>
