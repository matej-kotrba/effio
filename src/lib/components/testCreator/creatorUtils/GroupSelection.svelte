<script lang="ts">
	import { getTestObject } from '~stores/testObject';
	import { page } from '$app/stores';
	import { trpc } from '~/lib/trpc/client';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import NumberInput from '~components/inputs/NumberInput.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import AddNew from './AddNew.svelte';
	import Alert from '~components/ui/alert/alert.svelte';
	import { onMount } from 'svelte';

	export let testId: string = '';
	export let isPublic: boolean;

	const testObject = getTestObject();

	let groups:
		| Awaited<
				ReturnType<
					ReturnType<typeof trpc>['groups']['getGroupsByUserId']['query']
				>
		  >
		| 'fetching' = 'fetching';

	let radioGroup: {
		id: string;
		numberOfTries: number | null;
	}[] = [];

	onMount(() => {
		if ($testObject.includedInGroups === undefined) {
			$testObject.includedInGroups = {
				public: isPublic,
				subcategorySelect: radioGroup.map((item) => {
					return {
						id: item.id,
						numberOfTriesForUser: item.numberOfTries
					};
				})
			};
		} else {
			$testObject.includedInGroups.public = isPublic;
			$testObject.includedInGroups.subcategorySelect = radioGroup.map(
				(item) => {
					return {
						id: item.id,
						numberOfTriesForUser: item.numberOfTries
					};
				}
			);
		}
	});

	$: {
		if ($testObject.includedInGroups) {
			$testObject.includedInGroups.public = isPublic;
			const newData = radioGroup.map((item, index) => {
				return {
					...$testObject.includedInGroups!.subcategorySelect[index],
					id: item.id,
					numberOfTriesForUser: item.numberOfTries
				};
			});
			$testObject.includedInGroups.subcategorySelect = newData;
		}
	}

	async function onInitialGroupDisplay() {
		if (groups !== 'fetching') return;
		const userGroups = await trpc($page).groups.getGroupsByUserId.query({
			alsoUser: false,
			includeSubcategories: true,
			excludeEmptyGroups: true
		});

		radioGroup = userGroups.map((_) => {
			return {
				id: '',
				numberOfTries: null
			};
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
			const newCategories: GroupSelect[] = [];
			usedSubcategories.map((item) => {
				const id = ids.indexOf(item.subcategoryId);
				if (id !== -1) {
					newCategories[id] = {
						id: item.subcategoryId,
						numberOfTriesForUser: item.numberOfTries
					};
				}
			});
			console.log(newCategories);

			radioGroup = newCategories.map((item) => {
				return {
					id: item.id,
					numberOfTries: item.numberOfTriesForUser
				};
			});
		}

		groups = userGroups;
	}
</script>

<div class="flex items-center gap-2 mb-1">
	<label for="public">Should test be public?</label>
	<input
		type="checkbox"
		class="checkbox checkbox-primary dark:checkbox-accent"
		value="public"
		name="public"
		bind:checked={isPublic}
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
			{#if groups.length === 0}
				<div class="flex flex-col items-center gap-1">
					<iconify-icon
						icon="solar:mask-sad-linear"
						class="text-xl text-light_text_black_40 dark:text-dark_text_white_40"
					/>
					<p class="text-light_text_black_60 dark:text-dark_text_white_60">
						No groups to add tests to!
					</p>
				</div>
			{/if}
			{#each groups as group, index}
				{#if group['groupsSubcategories'].length > 0}
					<Collapsible
						title={group.name}
						shouldWrap={false}
						class="w-full mb-1 bg-gray-100"
						buttonClasses={radioGroup[index].id
							? 'bg-light_quaternary dark:bg-dark_secondary'
							: ''}
					>
						{#each group['groupsSubcategories'] as subcategory}
							{@const checked = radioGroup[index]['id'] === subcategory.id}
							<div class="mb-1 grid-input__container">
								<label for={subcategory.slug}>{subcategory.name}</label>
								<input
									type="radio"
									{checked}
									bind:group={radioGroup[index].id}
									class="radio radio-primary dark:radio-accent"
									value={subcategory.id}
									name={group.slug}
									on:click={() => {
										if (checked === true) {
											radioGroup[index].id = '';
										}
									}}
								/>
							</div>
						{/each}
						<ErrorEnhance
							error={$testObject.includedInGroups?.subcategorySelect[index]
								.numberOfTriesForUserError}
						>
							<NumberInput
								allowDecimal={false}
								canBeNullable={true}
								min={1}
								isPositive={true}
								inputTitle="Number of tries (leave blank for infinite)"
								on:inputChange={(data) => {
									if (isNaN(data.detail)) {
										radioGroup[index].numberOfTries = null;
									} else {
										radioGroup[index].numberOfTries = data.detail;
									}
								}}
								on:error={(data) => {
									if ($testObject.includedInGroups?.subcategorySelect[index]) {
										$testObject.includedInGroups.subcategorySelect[
											index
										].numberOfTriesForUserError = data.detail;
									}
								}}
							/>
						</ErrorEnhance>
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
						buttonClasses={checkboxGroup[index]
							? 'bg-light_quaternary dark:bg-dark_secondary'
							: ''}
					>
						{#each group['groupsSubcategories'] as subcategory}
							{@const checked = checkboxGroup[index] === subcategory.id}
							<div class="mb-1 grid-input__container">
								<label for={subcategory.slug}>{subcategory.name}</label>
								<input
									type="radio"
									{checked}
									bind:group={checkboxGroup[index]}
									class="radio radio-primary dark:radio-accent"
									value={subcategory.id}
									name={group.slug}
									on:click={() => {
										if (checked === true) {
											checkboxGroup[index] = '';
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
