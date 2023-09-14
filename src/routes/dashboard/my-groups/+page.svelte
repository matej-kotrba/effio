<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import UserGroups from '~components/page-parts/UserGroups.svelte';
</script>

<DashboardTitle
	title="My Groups"
	subtitle="See all groups you are a member of."
/>

<UserGroups groups={[]} />
