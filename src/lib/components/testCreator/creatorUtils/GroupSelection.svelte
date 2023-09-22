<script lang="ts">
	import type { Group } from '@prisma/client';
	import { bind } from 'svelte/internal';

	export let groups: Group[];

	let checkboxGroup: string[] = [];

	$: console.log(checkboxGroup);
</script>

<details class="mb-32 dropdown">
	<summary class="m-1 btn">Group Selection</summary>
	<ul class="p-2 shadow menu dropdown-content z-[100] bg-base-100 w-52">
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
	</ul>
</details>
