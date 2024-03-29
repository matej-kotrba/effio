<script lang="ts">
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
	} from '~schemas/testValidation';
	import { getTestObject } from '~stores/testObject';
	import ImageImport from '~components/inputs/ImageImport.svelte';
	import GroupSelection from '~components/testCreator/creatorUtils/GroupSelection.svelte';
	import MarkSystem from '~components/testCreator/creatorUtils/MarkSystem.svelte';
	import { initializeTestToTestStore } from '~helpers/test/test';
	import type { Tag, TestType } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Input from '~components/testTaking/Input.svelte';
	import { get } from 'svelte/store';
	import TagSelectionComponent from '~components/containers/tag/TagSelectionComponent.svelte';
	import { DB_STRING_MESSAGE, DB_STRING_REGEX } from '~helpers/constants';

	export let testType: TestType;
	export let testData:
		| NonNullable<
				Awaited<ReturnType<ReturnType<typeof trpc>['getTestById']['query']>>
		  >
		| undefined = undefined;

	const testObject = getTestObject();

	// $: {
	// 	if (testData) {
	// 		initializeTestToTestStore(testObject, testData);
	// 	}
	// }

	export let testImageFile: File | undefined = undefined;

	let tags: Tag[] = [];
	let visibleTags = tags;
	let gotTags = false;

	const defaultMarkSystemData = get(testObject)?.markSystem;

	async function getTags() {
		if (gotTags === true) return;
		const tagsResponse = await trpc($page).getTagss.query();
		if (tagsResponse.success && tagsResponse.tags) {
			tags = tagsResponse.tags;
			visibleTags = tags;
			gotTags = true;
		}
	}

	function onTagSelectionChange(e: CustomEvent<string[]>) {
		const newTags = e.detail
			.map((item) => {
				const tag = tags.find((tag) => tag.slug === item);
				return tag?.id || undefined;
			})
			.filter((item) => item !== undefined) as string[];
		$testObject.tagIds = newTags;
	}

	if (browser) {
		getTags();
	}
</script>

<div class="flex flex-col w-full gap-4">
	<ErrorEnhance error={$testObject.errors.title}>
		<TextInput
			validator={{ query: DB_STRING_REGEX, message: DB_STRING_MESSAGE }}
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
			title="Test image"
			bind:exportedFile={testImageFile}
			defualtImage={testData?.imageUrl}
			class="w-[156px]"
		/>
	</div>
	<div class="z-[20]">
		<div class="flex items-center gap-2 mr-auto">
			{#if testType === 'REGULAR'}
				<label for="random-questions" class="text-body1 @xl:text-body1"
					>Randomize question order</label
				>
				<input
					type="checkbox"
					name="random-questions"
					class="checkbox checkbox-primary dark:checkbox-accent"
					bind:checked={$testObject.randomizeQuestionOrder}
				/>
			{/if}
		</div>
		<div>
			<TagSelectionComponent
				on:tagsChanged={onTagSelectionChange}
				{tags}
				usedTagsSlugs={testData?.tags.map((item) => {
					return item.tag.slug;
				}) || []}
			/>
			<GroupSelection testId={testData?.id} />
		</div>
	</div>
	{#if testType !== 'PROGRAMMING'}
		<MarkSystem
			isAdded={!!defaultMarkSystemData}
			defaultValue={defaultMarkSystemData.marks}
		/>
	{/if}
	<slot {testImageFile} />
</div>
