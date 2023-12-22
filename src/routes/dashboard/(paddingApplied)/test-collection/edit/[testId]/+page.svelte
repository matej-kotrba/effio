<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { testObject } from '~stores/testObject.js';
	import { initializeTestToTestStore } from '~helpers/test/test.js';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { toast as Toast } from 'svelte-french-toast';
	import ScreenCover from '~components/loaders/ScreenCover.svelte';
	import { TRPCClientError } from '@trpc/client';
	import { validateTestAndRecordIt } from '~helpers/testGroupCalls.js';
	import ProgrammingCreator from '~components/testCreator/ProgrammingCreator.svelte';
	import TestDetails from '../../../test-creator/TestDetails.svelte';
	import Toggle from '~components/inputs/Toggle.svelte';

	export let data;

	const toast: typeof Toast = getContext('toast');

	let isSubmitting = false;

	let testImageFile: File | null = null;

	initializeTestToTestStore(data.testData);

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
				tagIds: $testObject.tagIds,
				isRandomized: !!$testObject.randomizeQuestionOrder
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

<div class="inline-block">
	<DashboardTitle
		title="Test Editor"
		subtitle="Here you can edit your previously created test"
	/>
</div>
<div
	class="sticky top-0 z-20 inline-flex items-center float-right gap-3 p-2 ml-auto rounded-bl-lg backdrop-blur-xl"
>
	<Toggle
		title="Is Published"
		isChecked={$testObject.published}
		class="items-center justify-end"
		on:toggle={(e) => ($testObject.published = e.detail)}
	/>
	<BasicButton
		title="Update test"
		buttonAttributes={{
			disabled: isSubmitting
		}}
		onClick={postEditedTest}
	/>
</div>

<TestDetails
	sectionTransitionDuration={0}
	testType={data.testData.type}
	testData={data.testData}
/>
<Space gap={10} />
{#if data.testData.type === 'REGULAR'}
	<Creator inputTemplates={data.questionTemplates} />
{:else if data.testData.type === 'PROGRAMMING'}
	<Space gap={10} />
	<ProgrammingCreator
		programmingTemplate={data.programmingTemplate}
		createNewQuestion={false}
	/>
{/if}
