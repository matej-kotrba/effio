<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import DarkModeToggle from '~components/globals/DarkModeToggle.svelte';
	import { applicationStates } from '~stores/applicationStates';

	type Link = {
		title: string;
		href: string;
		icon: string;
	};
	export let links: Link[];

	export let isSidebarShown: boolean;
	export let session: UpdatedSession;
	export let setSidebarShown: (value: boolean) => void;
</script>

<!-- Main sidebar -->
<aside
	class="bg-light_white dark:bg-dark_black sm:bg-none min-w-[100vw] xs:min-w-[210px] md:max-w-[210px]
			 lg:max-w-[260px] md:block fixed md:sticky top-0 duration-150 {isSidebarShown
		? 'left-0'
		: 'left-[-100vw] xs:left-[-210px]'} md:left-0 z-[10] min-h-[100svh] max-h-[100svh]
			  border-r-2 border-solid border-light_text_black_20"
>
	<!-- Closes sidebar (for low width screens) -->
	<div class="flex justify-end md:hidden">
		<button
			type="button"
			class="ml-auto"
			on:click={() => setSidebarShown(!isSidebarShown)}
		>
			<iconify-icon icon="ic:round-close" class="text-3xl" />
		</button>
	</div>
	<!-- Links of the sidebar -->
	<div class="flex flex-col items-center px-2 xl:px-4">
		<a class="w-[160px]" on:click={() => setSidebarShown(false)} href="/">
			<img
				src={$applicationStates['darkMode']['isDarkMode']
					? '/imgs/effio/text-dark.png'
					: '/imgs/effio/text.png'}
				alt="Effio logo"
				class="drop-shadow-primary h-[100px] object-contain"
			/>
		</a>
		<div class="flex flex-col items-center gap-2">
			{#each links as { title, icon, href }}
				<a
					on:click={() => setSidebarShown(false)}
					href="/{href}"
					class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
					class:active={browser && $page.url.pathname === `/${href}`}
					class:dark={$applicationStates['darkMode']['isDarkMode']}
				>
					<iconify-icon {icon} class="text-2xl w-[25px]" />{title}
				</a>
			{/each}

			<!-- <a
				on:click={() => (isSidebarShown = false)}
				href="/dashboard"
				class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
				class:active={browser && $page.url.pathname === '/dashboard'}
				class:dark={$applicationStates['darkMode']['isDarkMode']}
			>
				<iconify-icon icon="foundation:graph-pie" class="text-2xl w-[25px]" /> Overview
			</a>
			<a
				on:click={() => (isSidebarShown = false)}
				href="/dashboard/test-creator"
				class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
				class:dark={$applicationStates}
				class:active={browser &&
					$page.url.pathname.startsWith('/dashboard/test-creator')}
			>
				<iconify-icon icon="system-uicons:create" class="text-2xl w-[25px]" /> Create
				a new test
			</a>
			<a
				on:click={() => (isSidebarShown = false)}
				href="/dashboard/test-collection"
				class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
				class:dark={$applicationStates}
				class:active={browser &&
					$page.url.pathname.startsWith('/dashboard/test-collection')}
			>
				<iconify-icon
					icon="heroicons-solid:collection"
					class="text-2xl w-[25px]"
				/> Test collection
			</a>
			<a
				on:click={() => (isSidebarShown = false)}
				href="/dashboard/test-history"
				class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
				class:dark={$applicationStates}
				class:active={browser &&
					$page.url.pathname.startsWith('/dashboard/test-history')}
			>
				<iconify-icon icon="ic:round-history" class="text-2xl w-[25px]" /> Test History
			</a>
			<a
				on:click={() => (isSidebarShown = false)}
				href="/dashboard/my-groups"
				class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
				class:dark={$applicationStates}
				class:active={browser &&
					$page.url.pathname.startsWith('/dashboard/my-groups')}
			>
				<iconify-icon icon="ion:share-social" class="text-2xl w-[25px]" />
				My Groups
			</a>
			<a
				on:click={() => (isSidebarShown = false)}
				href="/community"
				class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
			>
				<iconify-icon
					icon="fluent:people-community-24-filled"
					class="text-2xl w-[25px]"
				/> Community place
			</a> -->
		</div>
		<!-- Lower part of the sidebar (darkmode, account for low width screens) -->
		<div class="block xs:hidden">
			<div
				class="absolute left-0 flex justify-between w-full gap-1 px-2 bottom-2"
			>
				<div class="dropdown dropdown-hover dropdown-right dropdown-top">
					<button type="button">
						<img
							src={session?.user?.image}
							alt="Icon"
							width="50"
							referrerpolicy="no-referrer"
							class="object-cover rounded-full aspect-square"
						/>
					</button>
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<ul
						tabindex="0"
						class="dropdown-content z-[1] menu p-3 shadow bg-base-100 dark:bg-dark_light_grey rounded-box w-52"
					>
						<div class="flex flex-col">
							<span
								class="font-semibold text-center uppercase text-light_text_black dark:text-dark_text_white"
								>{session?.user?.name}</span
							>
							<span
								class="text-center text-light_text_black dark:text-dark_text_white_40 text-body3"
								>{session?.user?.email}</span
							>
						</div>
						<button
							class="flex items-center gap-1 px-2 py-1 mt-4 ml-auto duration-100 rounded-md hover:bg-light_grey dark:hover:bg-dark_text_white_20"
							type="button"
							on:click={async () =>
								await signOut({
									redirect: false,
									callbackUrl: '/?logout=true'
								})}
							>Log out
							<iconify-icon icon="mingcute:exit-line" class="text-2xl" />
						</button>
					</ul>
				</div>
				<DarkModeToggle />
			</div>
		</div>
	</div>
</aside>

<style>
	:global(.dark) .active {
		background-color: var(--dark-primary) !important;
		color: var(--dark-text-white) !important;
	}

	.active {
		background-color: var(--light-primary) !important;
		color: var(--light-white) !important;
	}
</style>
