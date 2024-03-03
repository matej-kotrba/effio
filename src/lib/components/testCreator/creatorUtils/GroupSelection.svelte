<script lang="ts">
	import { getTestObject } from '~stores/testObject';
	import { page } from '$app/stores';
	import { trpc } from '~/lib/trpc/client';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';

	// export let groupData: Prisma.GroupGetPayload<{
	// 	include: {
	// 		groupsSubcategories: true;
	// 	};
	// }>[];

	export let testId: string = '';

	const testObject = getTestObject();

	let groups:
		| Awaited<
				ReturnType<
					ReturnType<typeof trpc>['groups']['getGroupsByUserId']['query']
				>
		  >
		| 'fetching' = 'fetching';
	let checkboxGroup: (string | 'public')[] = ['public'];

	async function onInitialGroupDisplay() {
		if (groups !== 'fetching') return;
		const userGroups = await trpc($page).groups.getGroupsByUserId.query({
			alsoUser: false,
			includeSubcategories: true,
			excludeEmptyGroups: true
		});

		const usedSubcategories = testId
			? await trpc($page).groups.getSubcategoriesByTestId.query({
					id: testId
			  })
			: null;

		if (usedSubcategories) {
			const ids = userGroups
				.map((item) => {
					return item.groupsSubcategories.map((item) => item.id);
				})
				.flat();
			const newCategories: string[] = [];
			usedSubcategories.map((item) => {
				const id = ids.indexOf(item.subcategoryId);
				if (id !== -1) {
					newCategories[id] = item.subcategoryId;
				}
			});
			checkboxGroup = ['public', ...newCategories];
		}

		groups = userGroups;
		// checkboxGroup = ['public', ...groupData.map((item) => '#' + item.groupId)];
	}

	$: $testObject.includedInGroups = checkboxGroup
		.map((item) => {
			return item;
		})
		.filter((item) => !!item);
</script>

<div class="flex items-center gap-2 mb-1">
	<label for="public">Should test be public?</label>
	<input
		type="checkbox"
		bind:group={checkboxGroup}
		class="checkbox checkbox-primary dark:checkbox-accent"
		value="public"
		name="public"
	/>
</div>
<Collapsible
	class="w-full shadow-sm"
	title="Add test to groups"
	openedTitle="Pick groups to add test to"
	onOpen={onInitialGroupDisplay}
>
	<div>
		{#if groups === 'fetching'}
			<div class="mx-auto w-fit">
				<span class="loading loading-bars loading-lg" />
			</div>
		{:else}
			{#each groups as group, index}
				{#if group['groupsSubcategories'].length > 0}
					<Collapsible
						title={group.name}
						shouldWrap={false}
						class="w-full mb-1 bg-gray-100"
						buttonClasses={checkboxGroup[index + 1]
							? 'bg-light_quaternary dark:bg-dark_secondary'
							: ''}
					>
						{#each group['groupsSubcategories'] as subcategory}
							{@const checked = checkboxGroup[index + 1] === subcategory.id}
							<div class="mb-1 grid-input__container">
								<label for={subcategory.slug}>{subcategory.name}</label>
								<input
									type="radio"
									{checked}
									bind:group={checkboxGroup[index + 1]}
									class="radio radio-primary dark:radio-accent"
									value={subcategory.id}
									name={group.slug}
									on:click={() => {
										if (checked === true) {
											checkboxGroup[index + 1] = '';
										}
									}}
								/>
							</div>
						{/each}
					</Collapsible>
				{/if}
			{/each}
		{/if}
	</div>
</Collapsible>

<!-- <div class="dropdown dropdown-end dropdown-bottom z-[100]">
	<button
		type="button"
		class="m-1 btn dark:bg-dark_light_grey dark:text-white dark:border-dark_light_grey"
		on:click|once={onInitialGroupDisplay}>Group Selection</button
	> -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- <ul
		tabindex="0"
		class="p-2 shadow-md menu dropdown-content z-[1000000] bg-light_whiter dark:bg-dark_grey dark:bg-lig w-52 min-h-[80px] relative rounded-sm"
	>
		{#if typeof groups !== 'string'}
			<div class="mb-1 grid-input__container">
				<label for="public">Should test be public?</label>
				<input
					type="checkbox"
					bind:group={checkboxGroup}
					class="checkbox checkbox-primary dark:checkbox-accent"
					value="public"
					name="public"
				/>
			</div> -->
<!-- # before value is for case when a value would be named 'public' -->
<!-- {#each groups as group, index}
				{#if group['groupsSubcategories'].length > 0}
					<Collapsible
						title={group.name}
						shouldWrap={false}
						class="w-full mb-1 bg-gray-100"
						buttonClasses={checkboxGroup[index + 1]
							? 'bg-light_quaternary dark:bg-dark_secondary'
							: ''}
					>
						{#each group['groupsSubcategories'] as subcategory}
							{@const checked = checkboxGroup[index + 1] === subcategory.id}
							<div class="mb-1 grid-input__container">
								<label for={subcategory.slug}>{subcategory.name}</label>
								<input
									type="radio"
									{checked}
									bind:group={checkboxGroup[index + 1]}
									class="radio radio-primary dark:radio-accent"
									value={subcategory.id}
									name={group.slug}
									on:click={() => {
										if (checked === true) {
											checkboxGroup[index + 1] = '';
										}
									}}
								/>
							</div>
						{/each}
					</Collapsible>
				{/if}
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
</style> -->
