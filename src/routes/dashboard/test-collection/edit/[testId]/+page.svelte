<script lang="ts">
	import Toggle from '~components/inputs/Toggle.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { TITLE_MAX, TITLE_MIN, titleSchema } from '~schemas/textInput.js';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { testObject } from '~stores/testObject.js';
	import { initializeTestToTestStore, isValidatInputServer } from '~/lib/helpers/test';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { toast as Toast } from 'svelte-french-toast';
	import ScreenCover from '~components/loaders/ScreenCover.svelte';

	export let data;

	const toast: typeof Toast = getContext('toast');

	let isSubmitting = false;

	initializeTestToTestStore(data.testData);
</script>

{#if isSubmitting}
	<ScreenCover />
{/if}
<DashboardTitle title="Test editor" subtitle="Here you can edit your previously created test" />

<Toggle
	title="Is Published"
	isChecked={$testObject.published}
	class="justify-end mb-4"
	on:toggle={(e) => ($testObject.published = e.detail)}
/>

<ErrorEnhance>
	<TextInputSimple
		title="Test title"
		titleName="title"
		inputValue={$testObject.title}
		min={TITLE_MIN}
		max={TITLE_MAX}
		validationSchema={titleSchema}
		on:inputChange={(e) => ($testObject.title = e.detail)}
	/>
</ErrorEnhance>

<ErrorEnhance>
	<TextAreaInput
		title="Test title"
		titleName="title"
		inputValue={$testObject.description}
		min={TITLE_MIN}
		max={TITLE_MAX}
		validationSchema={titleSchema}
		on:inputChange={(e) => ($testObject.description = e.detail)}
	/>
</ErrorEnhance>

<Creator inputTemplates={data.questionsTypes} />

<Space />
<BasicButton
	title="Update test"
	buttonAttributes={{
		disabled: isSubmitting
	}}
	onClick={async () => {
		if (isSubmitting) return;
		if (!$testObject.id || !$testObject.published) {
			alert('Sorry, but this test is not valid and cannot be edited.');
			goto('/dashboard/test-collection');
			return;
		}
		const res = await isValidatInputServer($testObject);
		if (!res['success']) return;
		const data = await trpc($page).protected.updateTest.mutate({
			id: $testObject.id,
			title: $testObject.title,
			description: $testObject.description,
			isPublished: $testObject.published,
			questionContent: JSON.stringify($testObject.questions)
		});
		if (data['success']) {
			isSubmitting = true;
			await new Promise((resolve) => setTimeout(resolve, 2000));
			isSubmitting = false;
			toast['success']('Test updated successfully');
			goto('/dashboard/test-collection');
		}
	}}
/>
<Space />
