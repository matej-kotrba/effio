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
	import { TRPCError } from '@trpc/server';

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
			description: $testObject.description
		});

		// TODO: Check if the isValidServer is needed here

		if (result['store']['questions']) {
			$testObject['questions'] = result['store']['questions'];
		}

		$testObject.errors.title = result['store']['errors']['title'] || undefined;
		$testObject.errors.description =
			result['store']['errors']['description'] || undefined;

		if (result['message']) {
			toast.error(result['message']);
		}

		$testObject = $testObject;
		if (result['isError']) return;

		let data;
		try {
			data = await trpc($page).protected.updateTest.mutate({
				testGroupId: $testObject.id as string,
				title: $testObject.title,
				description: $testObject.description,
				isPublished: $testObject.published as boolean,
				questionContent: JSON.stringify($testObject.questions)
			});
		} catch (e) {
			if (e instanceof TRPCError) {
				toast['error'](e.message);
			}
			return;
		}
		if (data['success']) {
			isSubmitting = true;
			await new Promise((resolve) => setTimeout(resolve, 2000));
			isSubmitting = false;
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
