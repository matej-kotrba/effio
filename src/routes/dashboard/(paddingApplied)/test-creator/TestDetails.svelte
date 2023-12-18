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
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import { isTestValidAndSetErrorsToTestObject } from '~helpers/test';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import Skewed from '~components/loaders/Skewed.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import Space from '~components/separators/Space.svelte';
	import { validateTestAndRecordIt } from '~helpers/testGroupCalls.js';
	import { createTRPCErrorNotification } from '~/lib/utils/notification.js';
	import { TRPCClientError } from '@trpc/client';
	import { goto } from '$app/navigation';
	import type { Tag, TestType } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import TagContainer from './Tag.svelte';
	import IconButton from '~components/buttons/IconButton.svelte';
	import { onMount } from 'svelte';

	export let sectionTransitionDuration: number;
	export let testType: TestType;

	let testImageFile: File | undefined = undefined;

	let finishModal: HTMLDialogElement;
	let openTagModal: () => void;

	let tags: Tag[] = [];
	let visibleTags = tags;
	let gotTags = false;

	let isSubmitting = false;
	let isSuccess = false;

	async function checkTestOnClientAndServerAndPostTestToDB(
		isPublished: boolean
	) {
		if (isSubmitting) return;
		isSubmitting = true;

		// Programming tests should not have marking system

		await validateTestAndRecordIt({
			type: 'create',
			data: {
				title: $testObject.title,
				description: $testObject.description,
				questions: $testObject.questions,
				markSystem: testType === 'PROGRAMMING' ? {} : $testObject.markSystem,
				isPublished: isPublished,
				testType: testType,
				image: testImageFile || undefined,
				tagIds: $testObject.tagIds
			},
			callbacks: {
				onSaveToDB(response) {
					isSuccess = response.success;
					isSubmitting = false;

					if (isSuccess) {
						goto('/dashboard/test-collection');
					}
				},
				onErrorSaveToDB(e) {
					if (e instanceof TRPCClientError) {
						createTRPCErrorNotification(e);
					}
					isSubmitting = false;
				}
			}
		});
	}

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
</script>

<div
	in:fly={{
		x: 300,
		duration: sectionTransitionDuration,
		delay: sectionTransitionDuration
	}}
	out:fly={{
		x: -300,
		duration: $navigating === null ? sectionTransitionDuration : 0
	}}
>
	<div class="flex flex-col gap-4">
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

		<div class="flex gap-4">
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
			<ImageImport title="Test photo" bind:exportedFile={testImageFile} />
		</div>
		<div class="flex justify-end">
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
			<GroupSelection />
		</div>
		{#if testType !== 'PROGRAMMING'}
			<MarkSystem />
		{/if}
		<div class="flex justify-center gap-6 my-4">
			<BasicButton
				onClick={() => {}}
				title={'Preview'}
				class={'bg-white text-light_primary hover:text-white hover:bg-light_primary'}
			/>
			<BasicButton
				onClick={() => {
					const result = isTestValidAndSetErrorsToTestObject({
						title: $testObject.title,
						description: $testObject.description,
						questions: $testObject.questions,
						markSystem: $testObject.markSystem
					});

					if (result['isError']) {
						$testObject.errors = result['store']['errors'];
						return;
					}
					finishModal?.showModal();
				}}
				title={'Finish'}
			/>
		</div>
		<dialog bind:this={finishModal} class="modal">
			<form
				method="dialog"
				class="relative modal-box bg-light_whiter dark:bg-dark_grey text-light_text_black dark:text-dark_text_white"
			>
				<SuccessKeyframe
					successMessage="Success!"
					visible={isSuccess}
					class="absolute top-0 left-0 w-full h-full bg-white dark:bg-dark_grey"
				/>
				<div
					class="bg-light_text_black_40 absolute inset-0 grid place-content-center duration-150 {isSubmitting
						? 'opacity-100 pointer-events-auto'
						: 'opacity-0 pointer-events-none'}"
				>
					<Skewed />
				</div>
				<div class="modal-action">
					<button type="button" on:click={() => finishModal.close()}>
						<iconify-icon
							icon="ic:round-close"
							class="absolute text-2xl top-4 right-4"
						/></button
					>
				</div>
				<h3 class="text-lg font-bold text-center">Finishing your test</h3>
				<Separator
					w={'80%'}
					h={'1px'}
					color={$applicationStates['darkMode']
						? 'var(--dark-text-white-20)'
						: 'var(--light-text-black-20)'}
				/>
				<p class="py-4 text-center text-body1">
					Your test named <span class="block font-semibold"
						>{$testObject['title']}</span
					><Space gap={20} /> with a description:
					<span class="block font-semibold">{$testObject['description']}</span
					><br />
					<Separator
						w={'50%'}
						h={'1px'}
						color={$applicationStates['darkMode']
							? 'var(--dark-text-white-20)'
							: 'var(--light-text-black-20)'}
					/>
					should be
				</p>
				<div class="flex justify-center gap-3">
					<button
						type="button"
						disabled={isSubmitting}
						class="btn btn-outline text-light_secondary dark:text-dark_primary outline-light_primary dark:outline-dark_primary hover:text-light_primary dark:hover:text-dark_primary hover:bg-gray-200 dark:hover:bg-dark_light_grey"
						on:click={() => checkTestOnClientAndServerAndPostTestToDB(false)}
						>Saved as draft</button
					>
					<button
						type="button"
						disabled={isSubmitting}
						class="btn bg-light_primary dark:bg-dark_primary text-light_whiter hover:bg-light_secondary dark:hover:bg-dark_primary_light"
						on:click={() => checkTestOnClientAndServerAndPostTestToDB(true)}
						>Published</button
					>
				</div>
			</form>
		</dialog>
	</div>
</div>
