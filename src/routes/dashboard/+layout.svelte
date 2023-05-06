<script lang="ts">
	import Icon from '@iconify/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
</script>

<main class="h-full grid__layout">
	<aside class="px-2">
		<div class="flex flex-col items-center">
			<img src="/imgs/logo.png" alt="Effio logo" width="90" />
			<div class="flex flex-col items-center gap-2">
				<a
					href="/dashboard"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
					class:active={browser && $page.url.pathname === '/dashboard'}
				>
					<Icon icon="foundation:graph-pie" class="text-2xl" /> Overview
				</a>
				<a
					href="#"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
				>
					<Icon icon="material-symbols:edit-square-outline-rounded" class="text-2xl" /> Create a new
					test
				</a>
				<a
					href="/dashboard/test-collection"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
					class:active={browser && $page.url.pathname === '/dashboard/test-collection'}
				>
					<Icon icon="heroicons-solid:collection" class="text-2xl" /> Test collection
				</a>
				<a
					href="#"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
				>
					<Icon icon="fluent:people-community-24-filled" class="text-2xl" /> Community place
				</a>
			</div>
		</div>
	</aside>
	<div class="content">
		<slot />
	</div>
</main>

<style>
	.grid__layout {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr;
	}

	.grid__layout > aside {
		max-width: 300px;
	}

	.active {
		background-color: var(--light-primary);
		color: var(--light-white);
	}
</style>
