<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import Icon from '@iconify/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { signOut } from '@auth/sveltekit/client';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	export let data: PageData;

	$: isSidebarShown = false;
	$: isSidebarCollapsible = false;

	onMount(() => {
		const width = getComputedStyle(document.documentElement).width;
		if (+width.slice(0, width.length - 2) < 768) {
			isSidebarCollapsible = true;
		} else {
			isSidebarCollapsible = false;
		}
		window.addEventListener('resize', (e) => {
			const width = getComputedStyle(document.documentElement).width;
			if (+width.slice(0, width.length - 2) < 768) {
				isSidebarCollapsible = true;
			} else {
				isSidebarCollapsible = false;
			}
		});
	});
</script>

<main
	class="h-full duration-100 grid__layout dark:bg-dark_black"
	class:layout__hidden={isSidebarCollapsible && !isSidebarShown}
>
	<div class="overflow-hidden">
		<aside
			class="bg-light_white dark:bg-dark_grey sm:bg-none sm:max-w-[300px] sm:min-w-[220px] absolute sm:block w-full sm:sticky top-0 z-[100] min-h-screen max-h-screen px-2 border-r-2 border-solid xl:px-4 border-light_text_black_20"
		>
			<div class="flex flex-col items-center">
				<a class="w-[90px] aspect-square" href="/">
					<img
						src="/imgs/logo.png"
						alt="Effio logo"
						width="90"
						class="drop-shadow-primary"
					/>
				</a>
				<div class="flex flex-col items-center gap-2">
					<a
						href="/dashboard"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 md:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:active={browser && $page.url.pathname === '/dashboard'}
						class:dark={$applicationStates['darkMode']['isDarkMode']}
					>
						<iconify-icon icon="foundation:graph-pie" class="text-2xl" /> Overview
					</a>
					<a
						href="/dashboard/test-creator"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 md:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:dark={$applicationStates}
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
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 md:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:dark={$applicationStates}
						class:active={browser &&
							$page.url.pathname === '/dashboard/test-collection'}
					>
						<iconify-icon icon="heroicons-solid:collection" class="text-2xl" /> Test
						collection
					</a>
					<a
						href="/dashboard/test-history"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 md:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:dark={$applicationStates}
						class:active={browser &&
							$page.url.pathname === '/dashboard/test-history'}
					>
						<iconify-icon icon="ic:round-history" class="text-2xl" /> Test History
					</a>
					<a
						href="/community"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 md:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
					>
						<iconify-icon
							icon="fluent:people-community-24-filled"
							class="text-2xl"
						/> Community place
					</a>
				</div>
			</div>
		</aside>
	</div>

	<div>
		<nav
			class="flex items-center justify-end gap-2 px-4 py-2 overflow-hidden border-b-2 border-light_text_black_20"
		>
			{#if isSidebarCollapsible}
				<button
					on:click={() => (isSidebarShown = !isSidebarShown)}
					class="mr-auto"
					type="button"
				>
					<iconify-icon icon="charm:menu-hamburger" class="text-3xl" />
				</button>
			{/if}
			<img
				src={data.session?.user?.image}
				alt="Icon"
				width="50"
				referrerpolicy="no-referrer"
				class="object-cover rounded-full aspect-square"
			/>
			<div class="flex flex-col">
				<span
					class="font-semibold uppercase text-light_text_black dark:text-dark_text_white"
					>{data.session?.user?.name}</span
				>
				<span
					class="text-light_text_black dark:text-dark_text_white_40 text-body3"
					>{data.session?.user?.email}</span
				>
			</div>
			<button
				class="relative grid h-10 place-content-center"
				type="button"
				on:click={() => $applicationStates.darkMode.setIsDarkMode()}
			>
				{#if $applicationStates['darkMode']['isDarkMode']}
					<iconify-icon
						icon="lucide:moon"
						class="text-4xl"
						in:fly={{
							y: -100,
							x: 0,
							duration: 150,
							delay: 150
						}}
						out:fly={{
							y: 100,
							x: 0,
							duration: 150
						}}
					/>
				{:else}
					<iconify-icon
						icon="mi:sun"
						class="text-4xl"
						in:fly={{
							y: -100,
							x: 0,
							duration: 150,
							delay: 150
						}}
						out:fly={{
							y: 100,
							x: 0,
							duration: 150
						}}
					/>
				{/if}
			</button>
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

	.grid__layout.layout__hidden {
		grid-template-columns: 0 1fr;
	}

	:global(.dark) .active {
		background-color: var(--dark-primary);
		color: var(--dark-text-white);
	}

	.active {
		background-color: var(--light-primary);
		color: var(--light-white);
	}
</style>
