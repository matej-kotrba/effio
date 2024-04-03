<script lang="ts">
	import TestOverview from '~components/testTaking/TestOverview.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TestOverview
	subcategoryConnection={data.testContent.subcategories[0]}
	numberOfUserTries={data.numberOfTriesCount}
	displayRelatedTests={false}
	isRandomShuffled={data.testContent.randomQuestionOrder}
	testContent={data.testContent}
	testLink={`${$page.url.pathname}/take`}
/>
