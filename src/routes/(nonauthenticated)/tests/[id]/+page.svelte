<script lang="ts">
	import TestOverview from '~components/testTaking/TestOverview.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TestOverview
	testContent={data.testContent}
	testLink={`${$page.url.pathname}/take`}
/>
