<script lang="ts">
	import TestOverview from '~components/testTaking/TestOverview.svelte';

	export let data;
</script>

<TestOverview testContent={data.testContent} />
