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
		isTestValid,
		isValidInputServer
	} from '~/lib/helpers/test';
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

	export let data;

	const toast: typeof Toast = getContext('toast');

	let isSubmitting = false;

	initializeTestToTestStore(data.testData);

	async function postEditedTest() {
		if (isSubmitting) return;
		if (!$testObject.id || $testObject.published === undefined) {
			alert('Sorry, but this test is not valid and cannot be edited.');
			goto('/dashboard/test-collection');
			return;
		}
		const result = isTestValid({
			title: $testObject.title,
			questions: $testObject.questions,
			description: $testObject.description,
			markSystem: $testObject.markSystem
		});

		if (result['isError']) {
			$testObject.errors = result['store']['errors'];
			if (result['store']['questions']) {
				$testObject.questions = result['store']['questions'];
			}
			return;
		}

		const serverResult = await isValidInputServer({
			title: $testObject.title,
			description: $testObject.description,
			questions: $testObject.questions,
			markSystem: $testObject.markSystem
		});

		if (serverResult.success === false) {
			$testObject.errors = result['store']['errors'];
			if (result['store']['questions']) {
				$testObject.questions = result['store']['questions'];
			}
			return;
		}

		let data;
		try {
			isSubmitting = true;
			data = await trpc($page).protected.updateTest.mutate({
				testGroupId: $testObject.id as string,
				title: $testObject.title,
				description: $testObject.description,
				isPublished: $testObject.published as boolean,
				questionContent: JSON.stringify($testObject.questions),
				markSystem: $testObject.markSystem?.marks
					? {
							marks: $testObject.markSystem.marks.map((item) => {
								return {
									name: item.name,
									// Checked in the isTestValid
									limit: item.limit as number
								};
							})
					  }
					: undefined
			});
		} catch (e) {
			if (e instanceof TRPCClientError) {
				toast['error'](
					e.message || 'An error occurred while updating the test'
				);
			}
			return;
		} finally {
			isSubmitting = false;
		}
		if (data['success']) {
			toast['success']('Test updated successfully');
			goto('/dashboard/test-collection');
		}
	}
</script>

{#if isSubmitting}
	<ScreenCover />
{/if}
<DashboardTitle
	title="Test Editor"
	subtitle="Here you can edit your previously created test"
/>

<GroupSelection />

<Toggle
	title="Is Published"
	isChecked={$testObject.published}
	class="justify-end mb-4"
	on:toggle={(e) => ($testObject.published = e.detail)}
/>

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

<MarkSystem
	isAdded={!!$testObject.markSystem['marks']}
	defaultValue={$testObject.markSystem['marks']}
/>

<Creator inputTemplates={data.questionsTypes} />

<Space />
<BasicButton
	title="Update test"
	buttonAttributes={{
		disabled: isSubmitting
	}}
	onClick={postEditedTest}
/>
<Space />
