<script lang="ts">
	import Toggle from '~components/inputs/Toggle.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { TITLE_MAX, TITLE_MIN, titleSchema } from '~schemas/textInput.js';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { testObject } from '~stores/testObject.js';
	import { initializeTestToTestStore } from '~/lib/helpers/test';
	import { onMount } from 'svelte';

	export let data;

	initializeTestToTestStore(data.testData);
</script>

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
