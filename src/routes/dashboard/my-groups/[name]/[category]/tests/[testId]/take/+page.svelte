<script lang="ts">
	import TestTake from '~components/testTaking/TestTake.svelte';

	export let data;
</script>

<TestTake
	subcategoryId={data.subcategory.id}
	session={data.session}
	testContent={data.testContent}
/>
