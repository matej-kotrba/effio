<script lang="ts">
	import { navigating } from '$app/stores';
	import { fly } from 'svelte/transition';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import TextInput from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import {
		DESCRIPTION_MAX,
		DESCRIPTION_MIN,
		TITLE_MAX,
		TITLE_MIN,
		descriptionSchema,
		titleSchema
	} from '~schemas/textInput';
	import { testObject } from '~stores/testObject';
	import ImageImport from '~components/inputs/ImageImport.svelte';
	import GroupSelection from '~components/testCreator/creatorUtils/GroupSelection.svelte';
	import MarkSystem from '~components/testCreator/creatorUtils/MarkSystem.svelte';
	import { initializeTestToTestStore } from '~helpers/test/test';
	import type { Tag, TestType } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import TagContainer from './Tag.svelte';
	import IconButton from '~components/buttons/IconButton.svelte';

	export let sectionTransitionDuration: number;
	export let testType: TestType;
	export let testData:
		| NonNullable<
				Awaited<ReturnType<ReturnType<typeof trpc>['getTestById']['query']>>
		  >
		| undefined = undefined;

	$: {
		if (testData) {
			initializeTestToTestStore(testData);
		}
	}

	let testImageFile: File | undefined = undefined;

	let openTagModal: () => void;

	let tags: Tag[] = [];
	let visibleTags = tags;
	let gotTags = false;

	async function getTags() {
		if (gotTags === true) return;
		const tagsResponse = await trpc($page).getTags.query();
		if (tagsResponse.success && tagsResponse.tags) {
			tags = tagsResponse.tags;
			visibleTags = tags;
			gotTags = true;
		}
	}

	function onTagSearch(value: string) {
		visibleTags = tags.filter((tag) =>
			tag.name.toLowerCase().includes(value.toLowerCase())
		);
	}

	function clearAllFilters() {
		$testObject.tagIds = [];
	}

	//TODO: Maybe move that when the modal is opened
	if (browser) {
		getTags();
	}

	$: console.log($testObject);
</script>

<div class="max-w-[1000px] flex flex-col w-full gap-4">
	<ErrorEnhance error={$testObject.errors.title}>
		<TextInput
			displayOutside={true}
			title="What will be the name of your test?"
			titleName="name"
			inputValue={$testObject['title']}
			validationSchema={titleSchema}
			max={TITLE_MAX}
			min={TITLE_MIN}
			on:inputChange={(data) => {
				$testObject['title'] = data.detail;
			}}
			on:error={(data) => {
				$testObject.errors.title = data.detail;
			}}
		/>
	</ErrorEnhance>

	<div class="flex flex-col gap-4 md:flex-row">
		<div class="w-full">
			<ErrorEnhance error={$testObject.errors.description}>
				<TextAreaInput
					title="Describe what will your test be about."
					titleName="name"
					inputValue={$testObject['description']}
					validationSchema={descriptionSchema}
					min={DESCRIPTION_MIN}
					max={DESCRIPTION_MAX}
					on:inputChange={(data) => {
						$testObject['description'] = data.detail;
					}}
					on:error={(data) => {
						$testObject.errors.description = data.detail;
					}}
				/>
			</ErrorEnhance>
		</div>
		<ImageImport
			title="Test photo"
			bind:exportedFile={testImageFile}
			defualtImage={testData?.imageUrl}
		/>
	</div>
	<div class="@container">
		<div class="flex flex-col @xl:items-center @xl:flex-row gap-2 @xl:gap-0">
			<div class="flex items-center gap-2 mr-auto">
				<label for="random-questions" class="text-body2 @xl:text-body1"
					>Randomize question order</label
				>
				<input
					type="checkbox"
					name="random-questions"
					class="checkbox checkbox-primary dark:checkbox-accent"
					bind:checked={$testObject.randomizeQuestionOrder}
				/>
			</div>
			<div>
				<Dialog
					bind:open={openTagModal}
					title="Tag Selection"
					formClasses="max-w-[750px]"
				>
					<div class="grid grid-cols-5">
						<div class="grid items-center grid-cols-5 col-span-5 gap-2 mb-2">
							<!-- <span class="text-body1">Recently Used</span> -->
							<div class="flex items-center justify-center col-span-5">
								<!-- <span>All tags</span> -->
								<SearchBar
									searchFunction={onTagSearch}
									class="flex-1 px-4 max-w-[350px]"
								/>
								<IconButton
									icon="fluent:delete-28-filled"
									tootlip="Clear all filters"
									onClick={clearAllFilters}
									containerClasses="dropdown-top"
									tooltipClasses="mb-2"
								/>
							</div>
						</div>
						<div class="flex flex-col col-span-1 gap-1" />
						<div
							class="grid grid-cols-5 col-span-5 gap-2 max-h-[200px] h-[200px] px-2 overflow-y-auto pt-2 overscroll-contain"
						>
							{#if visibleTags.length === 0}
								<div class="col-span-5">
									<h6 class="text-center">No tag like that exists.</h6>
									<iconify-icon
										icon="solar:mask-sad-linear"
										class="grid place-content-center text-8xl text-light_text_black_20 dark:text-dark_text_white_20"
									/>
								</div>
							{/if}
							{#each visibleTags as tag}
								<TagContainer
									{tag}
									isSelected={$testObject.tagIds.includes(tag.id)}
									onSelect={(tag) => {
										if ($testObject.tagIds.includes(tag.id)) {
											$testObject.tagIds = $testObject.tagIds.filter(
												(id) => id !== tag.id
											);
										} else {
											$testObject.tagIds = [...$testObject.tagIds, tag.id];
										}
									}}
								/>
							{/each}
						</div>
					</div>
				</Dialog>
				<button
					on:click={openTagModal}
					class="m-1 btn dark:bg-dark_light_grey dark:text-white dark:border-dark_light_grey"
				>
					Tag Selection
				</button>
				<GroupSelection testId={testData?.id} />
			</div>
		</div>
	</div>
	{#if testType !== 'PROGRAMMING'}
		<MarkSystem />
	{/if}
	<slot {testImageFile} />
</div>
