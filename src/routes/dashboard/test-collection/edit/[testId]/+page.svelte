<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';

	export let data;
</script>

<DashboardTitle title="Test editor" subtitle="Here you can edit your previously created test" />
{data.testData.title}
