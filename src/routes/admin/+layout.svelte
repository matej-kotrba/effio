<script lang="ts">
	import DashboardSidebarWrapper from '~components/navigation/dashboard/DashboardSidebarWrapper.svelte';
	import Navbar from '~components/page-parts/Navbar.svelte';

	export let data;

	let isSidebarShown = false;
	let setIsSidebarShown: (value: boolean) => void;
</script>

<Navbar user={data.session} />
<div>
	<DashboardSidebarWrapper
		bind:setSidebarShown={setIsSidebarShown}
		{isSidebarShown}
		session={data.session}
		links={[
			{
				title: 'Overview',
				icon: 'foundation:graph-bar',
				href: 'admin'
			},
			{
				title: 'Users',
				icon: 'basil:user-solid',
				href: 'admin/users'
			},
			{
				title: 'Tests',
				icon: 'lets-icons:form-fill',
				href: 'admin/tests'
			}
		]}
	>
		<slot />
	</DashboardSidebarWrapper>
</div>
