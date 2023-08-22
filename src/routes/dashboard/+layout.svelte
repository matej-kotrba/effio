<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import Icon from '@iconify/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { signOut } from '@auth/sveltekit/client';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { LG } from '~/utils/responsive';

	export let data: PageData;

	$: isSidebarShown = false;
	$: isSidebarCollapsible = false;

	onMount(() => {
		const width = getComputedStyle(document.documentElement).width;
		if (+width.slice(0, width.length - 2) < LG) {
			isSidebarCollapsible = true;
		} else {
			isSidebarCollapsible = false;
		}
		window.addEventListener('resize', (e) => {
			const width = getComputedStyle(document.documentElement).width;
			if (+width.slice(0, width.length - 2) <= LG) {
				isSidebarCollapsible = true;
			} else {
				isSidebarCollapsible = false;
			}
		});
	});
</script>

<main
	class="h-full duration-100 grid__layout dark:bg-dark_black"
	class:layout__hidden={isSidebarCollapsible}
>
	<div class={isSidebarShown ? '' : ''}>
		<aside
			class="bg-light_white dark:bg-dark_grey sm:bg-none min-w-[100vw] xs:min-w-[210px] md:max-w-[210px]
			 lg:max-w-[260px] md:block sticky top-0 z-[100] min-h-screen max-h-screen
			  border-r-2 border-solid border-light_text_black_20 {isSidebarShown
				? 'w-full'
				: ''}"
		>
			{#if isSidebarCollapsible}
				<div class="flex justify-end">
					<button
						type="button"
						class="ml-auto"
						on:click={() => (isSidebarShown = !isSidebarShown)}
					>
						<iconify-icon icon="ic:round-close" class="text-3xl" />
					</button>
				</div>
			{/if}
			<div class="flex flex-col items-center px-2 xl:px-4">
				<a
					class="w-[90px] aspect-square"
					on:click={() => (isSidebarShown = false)}
					href="/"
				>
					<img
						src="/imgs/logo.png"
						alt="Effio logo"
						width="90"
						class="drop-shadow-primary"
					/>
				</a>
				<div class="flex flex-col items-center gap-2">
					<a
						on:click={() => (isSidebarShown = false)}
						href="/dashboard"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:active={browser && $page.url.pathname === '/dashboard'}
						class:dark={$applicationStates['darkMode']['isDarkMode']}
					>
						<iconify-icon icon="foundation:graph-pie" class="text-2xl" /> Overview
					</a>
					<a
						on:click={() => (isSidebarShown = false)}
						href="/dashboard/test-creator"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
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
						on:click={() => (isSidebarShown = false)}
						href="/dashboard/test-collection"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:dark={$applicationStates}
						class:active={browser &&
							$page.url.pathname === '/dashboard/test-collection'}
					>
						<iconify-icon icon="heroicons-solid:collection" class="text-2xl" /> Test
						collection
					</a>
					<a
						on:click={() => (isSidebarShown = false)}
						href="/dashboard/test-history"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:dark={$applicationStates}
						class:active={browser &&
							$page.url.pathname === '/dashboard/test-history'}
					>
						<iconify-icon icon="ic:round-history" class="text-2xl" /> Test History
					</a>
					<a
						on:click={() => (isSidebarShown = false)}
						href="/groups"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
					>
						<iconify-icon icon="ion:share-social" class="text-2xl" />
						My Groups
					</a>
					<a
						on:click={() => (isSidebarShown = false)}
						href="/community"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
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
			class="flex items-center justify-end gap-2 px-4 py-2 border-b-2 border-light_text_black_20"
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
			<div class="dropdown dropdown-hover dropdown-end dropdown-bottom">
				<img
					src={data.session?.user?.image}
					alt="Icon"
					width="50"
					referrerpolicy="no-referrer"
					class="object-cover rounded-full aspect-square"
				/>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content z-[1] menu p-3 shadow bg-base-100 dark:bg-dark_light_grey rounded-box w-52"
				>
					<div class="flex flex-col">
						<span
							class="font-semibold text-center uppercase text-light_text_black dark:text-dark_text_white"
							>{data.session?.user?.name}</span
						>
						<span
							class="text-center text-light_text_black dark:text-dark_text_white_40 text-body3"
							>{data.session?.user?.email}</span
						>
					</div>
					<button
						class="flex items-center gap-1 px-2 py-1 mt-4 ml-auto duration-100 rounded-md hover:bg-light_grey dark:hover:bg-dark_text_white_20"
						type="button"
						on:click={async () =>
							await signOut({ redirect: false, callbackUrl: '/?logout=true' })}
						>Log out
						<iconify-icon icon="mingcute:exit-line" class="text-2xl" />
					</button>
				</ul>
			</div>
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
		grid-template-columns: 0px 1fr;
	}

	:global(.dark) .active {
		background-color: var(--dark-primary) !important;
		color: var(--dark-text-white) !important;
	}

	.active {
		background-color: var(--light-primary) !important;
		color: var(--light-white) !important;
	}
</style>
