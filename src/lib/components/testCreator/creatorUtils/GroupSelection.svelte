<script lang="ts">
	import { testObject } from '~stores/testObject';
	import { page } from '$app/stores';
	import { trpc } from '~/lib/trpc/client';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';

	// export let groupData: Prisma.GroupGetPayload<{
	// 	include: {
	// 		groupsSubcategories: true;
	// 	};
	// }>[];

	export let testId: string = '';

	let groups:
		| Awaited<
				ReturnType<
					ReturnType<typeof trpc>['groups']['getGroupsByUserId']['query']
				>
		  >
		| 'fetching' = 'fetching';
	let checkboxGroup: (string | 'public')[] = ['public'];

	async function onInitialGroupDisplay() {
		const userGroups = await trpc($page).groups.getGroupsByUserId.query({
			alsoUser: false,
			includeSubcategories: true,
			excludeEmptyGroups: true
		});

		console.log(userGroups);

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
			console.log(newCategories);
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

<div class="dropdown dropdown-end dropdown-bottom">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		tabindex="0"
		class="m-1 btn dark:bg-dark_light_grey dark:text-white dark:border-dark_light_grey"
		on:click|once={onInitialGroupDisplay}>Group Selection</label
	>
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<ul
		tabindex="0"
		class="p-2 shadow-md menu dropdown-content z-[100] bg-light_whiter dark:bg-dark_grey dark:bg-lig w-52 min-h-[80px] relative rounded-sm"
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
			</div>
			<!-- # before value is for case when a value would be named 'public' -->
			{#each groups as group, index}
				{#if group['groupsSubcategories'].length > 0}
					<Collapsible
						title={group.name}
						class="w-full mb-1 bg-gray-100"
						buttonClasses={checkboxGroup[index + 1]
							? 'bg-light_quaternary'
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
</style>
