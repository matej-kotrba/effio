<script lang="ts">
	import { page } from '$app/stores';
	import type { Group } from '@prisma/client';
	import { trpc } from '~/lib/trpc/client';

	export let userId: string;

	let groups: Group[] | 'fetching' = 'fetching';
	let checkboxGroup: string[] = [];

	function onInitialGroupDisplay() {
		const userGroups = trpc($page).groups.getGroupsByUserId;
	}
</script>

<details class="mb-32 dropdown">
	<summary class="m-1 btn">Group Selection</summary>
	<ul
		class="p-2 shadow menu dropdown-content z-[100] bg-base-100 w-52 min-h-[80px]"
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
			asdasdasd
		{/if}
	</ul>
</details>
