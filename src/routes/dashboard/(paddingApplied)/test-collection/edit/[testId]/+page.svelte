<script lang="ts">
	import Toggle from '~components/inputs/Toggle.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import {
		DESCRIPTION_MAX,
		DESCRIPTION_MIN,
		TITLE_MAX,
		TITLE_MIN,
		descriptionSchema,
		titleSchema
	} from '~schemas/textInput.js';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { testObject } from '~stores/testObject.js';
	import {
		initializeTestToTestStore,
		isTestValidAndSetErrorsToTestObject,
		isValidInputServerAndSetErrorsToTestObject
	} from '~helpers/test/test.js';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { toast as Toast } from 'svelte-french-toast';
	import ScreenCover from '~components/loaders/ScreenCover.svelte';
	import { TRPCClientError } from '@trpc/client';
	import MarkSystem from '~components/testCreator/creatorUtils/MarkSystem.svelte';
	import GroupSelection from '~components/testCreator/creatorUtils/GroupSelection.svelte';
	import { validateTestAndRecordIt } from '~helpers/testGroupCalls.js';
	import ImageImport from '~components/inputs/ImageImport.svelte';
	import ProgrammingCreator from '~components/testCreator/ProgrammingCreator.svelte';

	export let data;

	const toast: typeof Toast = getContext('toast');

	let isSubmitting = false;

	let testImageFile: File | null = null;

	initializeTestToTestStore(data.testData!);

	async function postEditedTest() {
		if (isSubmitting) return;

		if (!$testObject.id || $testObject.published === undefined) {
			alert('Sorry, but this test is not valid and cannot be edited.');
			goto('/dashboard/test-collection');
			return;
		}

		isSubmitting = true;

		await validateTestAndRecordIt({
			type: 'update',
			data: {
				id: $testObject.id as string,
				title: $testObject.title,
				description: $testObject.description,
				questions: $testObject.questions,
				markSystem: $testObject.markSystem,
				isPublished: $testObject.published,
				image: testImageFile || undefined,
				tagIds: $testObject.tagIds
			},
			callbacks: {
				onSaveToDB(response) {
					isSubmitting = false;
					if (response['success']) {
						toast['success']('Test updated successfully');
						goto('/dashboard/test-collection');
					}
				},
				onErrorSaveToDB(e) {
					if (e instanceof TRPCClientError) {
						toast['error'](
							e.message || 'An error occurred while updating the test'
						);
					}
					isSubmitting = false;
					return;
				}
			}
		});

		// const result = isTestValidAndSetErrorsToTestObject({
		// 	title: $testObject.title,
		// 	questions: $testObject.questions,
		// 	description: $testObject.description,
		// 	markSystem: $testObject.markSystem
		// });

		// if (result['isError']) {
		// 	$testObject.errors = result['store']['errors'];
		// 	return;
		// }

		// const serverResult = await isValidInputServerAndSetErrorsToTestObject({
		// 	title: $testObject.title,
		// 	description: $testObject.description,
		// 	questions: $testObject.questions,
		// 	markSystem: $testObject.markSystem
		// });

		// if (serverResult.isError === true) {
		// 	$testObject.errors = result['store']['errors'];
		// 	return;
		// }

		// let data;
		// try {
		// 	data = await trpc($page).protected.updateTest.mutate({
		// 		testGroupId: $testObject.id as string,
		// 		title: $testObject.title,
		// 		description: $testObject.description,
		// 		isPublished: $testObject.published as boolean,
		// 		questionContent: JSON.stringify($testObject.questions),
		// 		markSystem: $testObject.markSystem?.marks
		// 			? {
		// 					marks: $testObject.markSystem.marks.map((item) => {
		// 						return {
		// 							name: item.name,
		// 							// Checked in the isTestValid
		// 							limit: item.limit as number
		// 						};
		// 					})
		// 			  }
		// 			: undefined,
		// 		includedInGroups: $testObject.includedInGroups
		// 	});
		// } catch (e) {
		// 	if (e instanceof TRPCClientError) {
		// 		toast['error'](
		// 			e.message || 'An error occurred while updating the test'
		// 		);
		// 	}
		// 	return;
		// } finally {
		// 	isSubmitting = false;
		// }
		// if (data['success']) {
		// 	toast['success']('Test updated successfully');
		// 	goto('/dashboard/test-collection');
		// }
	}
</script>

{#if isSubmitting}
	<ScreenCover />
{/if}
<DashboardTitle
	title="Test Editor"
	subtitle="Here you can edit your previously created test"
/>

<div class="flex items-center justify-end gap-1">
	<Toggle
		title="Is Published"
		isChecked={$testObject.published}
		class="items-center justify-end"
		on:toggle={(e) => ($testObject.published = e.detail)}
	/>
	<GroupSelection testId={data.testData.id} />
</div>

<ErrorEnhance error={$testObject.errors.title}>
	<TextInputSimple
		title="Test title"
		titleName="title"
		inputValue={$testObject.title}
		min={TITLE_MIN}
		max={TITLE_MAX}
		validationSchema={titleSchema}
		on:inputChange={(e) => ($testObject.title = e.detail)}
		on:error={(e) => ($testObject.errors.title = e.detail)}
	/>
</ErrorEnhance>

<div class="flex gap-4">
	<div class="w-full">
		<ErrorEnhance error={$testObject.errors.description}>
			<TextAreaInput
				title="Test description"
				titleName="description"
				inputValue={$testObject.description}
				min={DESCRIPTION_MIN}
				max={DESCRIPTION_MAX}
				validationSchema={descriptionSchema}
				on:inputChange={(e) => ($testObject.description = e.detail)}
				on:error={(e) => ($testObject.errors.description = e.detail)}
			/>
		</ErrorEnhance>
	</div>
	<ImageImport
		title="Test photo"
		bind:exportedFile={testImageFile}
		defualtImage={data.testData.imageUrl}
	/>
</div>
<MarkSystem
	isAdded={!!$testObject.markSystem['marks']}
	defaultValue={$testObject.markSystem['marks']}
/>

{#if data.testData.type === 'REGULAR'}
	<Creator inputTemplates={data.questionTemplates} />
{:else if data.testData.type === 'PROGRAMMING'}
	<Space gap={10} />
	<ProgrammingCreator
		programmingTemplate={data.programmingTemplate}
		createNewQuestion={false}
	/>
{/if}

<Space />
<BasicButton
	title="Update test"
	buttonAttributes={{
		disabled: isSubmitting
	}}
	onClick={postEditedTest}
/>
<Space />
