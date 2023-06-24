<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { TITLE_MAX, TITLE_MIN, titleSchema } from '~schemas/textInput.js';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import { onMount } from 'svelte';
	import { testObject } from '~stores/testObject.js';

	export let data;

	onMount(() => {
		console.log(data.testData);
	});
</script>

<DashboardTitle title="Test editor" subtitle="Here you can edit your previously created test" />

<ErrorEnhance>
	<TextInputSimple
		title="Test title"
		titleName="title"
		inputValue={data.testData.title}
		min={TITLE_MIN}
		max={TITLE_MAX}
		validationSchema={titleSchema}
	/>
</ErrorEnhance>

<ErrorEnhance>
	<TextAreaInput
		title="Test title"
		titleName="title"
		inputValue={data.testData.description}
		min={TITLE_MIN}
		max={TITLE_MAX}
		validationSchema={titleSchema}
	/>
</ErrorEnhance>

<Creator inputTemplates={data.questionsTypes} />
