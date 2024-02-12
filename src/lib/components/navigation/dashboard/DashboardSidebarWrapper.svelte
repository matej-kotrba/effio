<script lang="ts">
	import Sidebar from './Sidebar.svelte';

	type Link = {
		title: string;
		href: string;
		icon: string;
	};
	export let links: Link[];

	export let isSidebarShown: boolean;
	export let session: UpdatedSession;
</script>

<main class="min-h-full duration-100 grid__layout dark:bg-dark_black">
	<div>
		<Sidebar {isSidebarShown} {session} {links} />
	</div>
	<div>
		<slot />
	</div>
</main>

<style>
	.grid__layout {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr;
	}

	@media (max-width: 768px) {
		.grid__layout {
			grid-template-columns: 0px 1fr;
		}
	}
</style>
