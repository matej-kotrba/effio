<script lang="ts">
	import TestTake from '~components/testTaking/TestTake.svelte';
	import Back from '~components/navigation/Back.svelte';
	import Space from '~components/separators/Space.svelte';

	export let data;
</script>

<Space gap={10} />
<Back
	link={`/dashboard/my-groups/${data.group.slug}/${data.subcategory.slug}/`}
/>
<TestTake
	subcategoryId={data.subcategory.id}
	session={data.session}
	testContent={data.testContent}
/>
