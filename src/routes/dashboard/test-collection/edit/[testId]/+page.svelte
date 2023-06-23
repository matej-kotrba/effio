<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { TITLE_MAX, TITLE_MIN, titleSchema } from '~schemas/textInput.js';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';

	export let data;
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
		on:error={(data) => {}}
	/>
</ErrorEnhance>
