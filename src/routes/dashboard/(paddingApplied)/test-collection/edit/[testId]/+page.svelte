<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { getTestObject } from '~stores/testObject.js';
	import { initializeTestToTestStore } from '~helpers/test/test.js';
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
	import FlexConfirm from '~components/buttons/FlexConfirm.svelte';
	import { fly } from 'svelte/transition';

	export let data;

	const testObject = getTestObject();

	let activeTab: 'details' | 'creator' = 'details';
	const TAB_FLY_DURATION = 300;

	const toast: typeof Toast = getContext('toast');

	let isSubmitting = false;

	let testImageFile: File | undefined = undefined;

	initializeTestToTestStore(testObject, data.testData);

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
				testObject: testObject,
				id: $testObject.id as string,
				title: $testObject.title,
				description: $testObject.description,
				questions: $testObject.questions,
				markSystem: $testObject.markSystem,
				isPublished: $testObject.published,
				image: testImageFile,
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
	}

	function changeActiveTab(tab: typeof activeTab) {
		activeTab = tab;
	}
</script>

{#if isSubmitting}
	<ScreenCover />
{/if}

<FlexConfirm onClick={postEditedTest}>
	<iconify-icon
		icon="charm:tick"
		class="text-3xl text-white duration-150 group-hover:text-light_text_black dark:group-hover:text-dark_text_white"
	/>
</FlexConfirm>

<div class="block">
	<DashboardTitle
		title="Test Editor"
		subtitle="Here you can edit your previously created test"
	/>
</div>
<div class="flex p-1 mb-4 rounded-lg bg-light_grey w-fit">
	<button
		on:click={() => changeActiveTab('details')}
		type="button"
		class="px-16 border-[1px] border-solid rounded-lg {activeTab === 'details'
			? 'bg-light_whiter border-light_text_black_20 text-light_text_black'
			: 'bg-transparent border-transparent text-light_text_black_60'}"
		>Details</button
	>
	<button
		on:click={() => changeActiveTab('creator')}
		type="button"
		class="px-16 border-[1px] border-solid rounded-lg {activeTab === 'creator'
			? 'bg-light_whiter border-light_text_black_20 text-light_text_black'
			: 'bg-transparent border-transparent text-light_text_black_60'}"
		>Creator</button
	>
</div>
{#if activeTab === 'details'}
	<div
		in:fly={{ x: -200, duration: TAB_FLY_DURATION, delay: TAB_FLY_DURATION }}
		out:fly={{ x: -200, duration: TAB_FLY_DURATION }}
	>
		<Toggle
			title="Is Published"
			isChecked={$testObject.published}
			class="items-center justify-end"
			on:toggle={(e) => ($testObject.published = e.detail)}
		/>
		<TestDetails
			testType={data.testData.type}
			testData={data.testData}
			bind:testImageFile
		/>
	</div>
{:else if activeTab === 'creator'}
	<div
		in:fly={{ x: 200, duration: TAB_FLY_DURATION, delay: TAB_FLY_DURATION }}
		out:fly={{ x: 200, duration: TAB_FLY_DURATION }}
	>
		{#if data.testData.type === 'REGULAR'}
			<Creator inputTemplates={data.questionTemplates} />
		{:else if data.testData.type === 'PROGRAMMING'}
			<ProgrammingCreator
				programmingTemplate={data.programmingTemplate}
				createNewQuestion={false}
			/>
		{/if}
	</div>
{/if}
<Space gap={50} />
