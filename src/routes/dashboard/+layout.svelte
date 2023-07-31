<script lang="ts">
	import Icon from '@iconify/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { signOut } from '@auth/sveltekit/client';

	export let data: PageData;
</script>

<main class="h-full grid__layout">
	<aside
		class="sticky top-0 z-[100] min-h-screen max-h-screen px-2 border-r-2 border-solid xl:px-4 border-light_text_black_20"
	>
		<div class="flex flex-col items-center">
			<div class="w-[90px] aspect-square">
				<img src="/imgs/logo.png" alt="Effio logo" width="90" />
			</div>
			<div class="flex flex-col items-center gap-2">
				<a
					href="/dashboard"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
					class:active={browser && $page.url.pathname === '/dashboard'}
				>
					<iconify-icon icon="foundation:graph-pie" class="text-2xl" /> Overview
				</a>
				<a
					href="/dashboard/test-creator"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
					class:active={browser &&
						$page.url.pathname === '/dashboard/test-creator'}
				>
					<iconify-icon
						icon="material-symbols:edit-square-outline-rounded"
						class="text-2xl"
					/> Create a new test
				</a>
				<a
					href="/dashboard/test-collection"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
					class:active={browser &&
						$page.url.pathname === '/dashboard/test-collection'}
				>
					<iconify-icon icon="heroicons-solid:collection" class="text-2xl" /> Test
					collection
				</a>
				<a
					href="/dashboard/test-history"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
					class:active={browser &&
						$page.url.pathname === '/dashboard/test-history'}
				>
					<iconify-icon icon="ic:round-history" class="text-2xl" /> Test History
				</a>
				<a
					href="/community"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 btn btn-ghost text-light_text_black"
				>
					<iconify-icon
						icon="fluent:people-community-24-filled"
						class="text-2xl"
					/> Community place
				</a>
			</div>
		</div>
	</aside>
	<div>
		<nav
			class="flex items-center justify-end gap-2 px-4 py-2 border-b-2 border-light_text_black_20"
		>
			<img
				src={data.session?.user?.image}
				alt="Icon"
				width="50"
				referrerpolicy="no-referrer"
				class="object-cover rounded-full aspect-square"
			/>
			<div class="flex flex-col">
				<span class="font-semibold uppercase text-light_text_black"
					>{data.session?.user?.name}</span
				>
				<span class="text-light_text_black_40 text-body3"
					>{data.session?.user?.email}</span
				>
			</div>
			<button
				class="ml-4"
				type="button"
				on:click={async () =>
					await signOut({ redirect: false, callbackUrl: '/?logout=true' })}
			>
				<Icon
					icon="iconamoon:exit-light"
					class="text-4xl duration-150 text-slate-500 hover:text-red-600 hover:scale-x-110"
				/></button
			>
		</nav>
		<div class="px-4 pt-6 md:px-8 xl:px-16 content">
			<slot />
		</div>
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
