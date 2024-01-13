<script lang="ts">
	import TestOverview from '~components/testTaking/TestOverview.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TestOverview
	viewCount={data.viewCount}
	userViewCount={data.userViewCount}
	testContent={data.testContent}
	testLink={`${$page.url.pathname}/take`}
/>
