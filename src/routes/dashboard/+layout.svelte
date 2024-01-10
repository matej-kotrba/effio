<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import { fly } from 'svelte/transition';

	export let data;

	let isSidebarShown = false;
	// $: isSidebarCollapsible = false;

	// onMount(() => {
	// 	const width = getComputedStyle(document.documentElement).width;
	// 	if (+width.slice(0, width.length - 2) < LG) {
	// 		isSidebarCollapsible = true;
	// 	} else {
	// 		isSidebarCollapsible = false;
	// 	}
	// 	window.addEventListener('resize', (e) => {
	// 		const width = getComputedStyle(document.documentElement).width;
	// 		if (+width.slice(0, width.length - 2) <= LG) {
	// 			isSidebarCollapsible = true;
	// 		} else {
	// 			isSidebarCollapsible = false;
	// 		}
	// 	});
	// });

	function getBreadcrumbsPath(index: number) {
		const parts = $page['url']['pathname']
			.split('/')
			.filter((item) => item !== '');

		let resultedPath = '';
		for (let i = 0; i <= index; i++) {
			resultedPath += '/' + parts[i];
		}
		return resultedPath;
	}

	const routeNameChanges: {
		[key: string]: string;
	} = {
		name: 'Group',
		category: 'Group channel',
		test: 'Test',
		testId: 'Test'
	};

	$: pathname = $page['url']['pathname']
		.split('/')
		.filter((item) => item !== '');

	$: route = $page['route']['id']?.split('/').filter((item) => item !== '');
</script>

<main class="min-h-full duration-100 grid__layout dark:bg-dark_black">
	<div>
		<!-- Main sidebar -->
		<aside
			class="bg-light_white dark:bg-dark_black sm:bg-none min-w-[100vw] xs:min-w-[210px] md:max-w-[210px]
			 lg:max-w-[260px] md:block fixed md:sticky top-0 duration-150 {isSidebarShown
				? 'left-0'
				: 'left-[-100vw] xs:left-[-210px]'} md:left-0 z-[100] min-h-[100svh] max-h-[100svh]
			  border-r-2 border-solid border-light_text_black_20"
		>
			<!-- Closes sidebar (for low width screens) -->
			<div class="flex justify-end md:hidden">
				<button
					type="button"
					class="ml-auto"
					on:click={() => (isSidebarShown = !isSidebarShown)}
				>
					<iconify-icon icon="ic:round-close" class="text-3xl" />
				</button>
			</div>
			<!-- Links of the sidebar -->
			<div class="flex flex-col items-center px-2 xl:px-4">
				<a class="w-[160px]" on:click={() => (isSidebarShown = false)} href="/">
					<img
						src={$applicationStates['darkMode']['isDarkMode']
							? '/imgs/effio/text-dark.png'
							: '/imgs/effio/text.png'}
						alt="Effio logo"
						class="drop-shadow-primary h-[100px] object-contain"
					/>
				</a>
				<div class="flex flex-col items-center gap-2">
					<a
						on:click={() => (isSidebarShown = false)}
						href="/dashboard"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:active={browser && $page.url.pathname === '/dashboard'}
						class:dark={$applicationStates['darkMode']['isDarkMode']}
					>
						<iconify-icon
							icon="foundation:graph-pie"
							class="text-2xl w-[25px]"
						/> Overview
					</a>
					<a
						on:click={() => (isSidebarShown = false)}
						href="/dashboard/test-creator"
						class="flex items-center justify-start w-full gap-2 px-6 py-3 duration-100 text-body3 lg:text-body2 btn dark:hover:bg-dark_text_white_20 btn-ghost text-light_text_black dark:text-dark_text_white"
						class:dark={$applicationStates}
						class:active={browser &&
							$page.url.pathname.startsWith('/dashboard/test-creator')}
					>
						<iconify-icon
							icon="system-uicons:create"
							class="text-2xl w-[25px]"
						/> Create a new test
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
						<iconify-icon icon="ic:round-history" class="text-2xl w-[25px]" /> Test
						History
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
					</a>
				</div>
				<!-- Lower part of the sidebar (darkmode, account for low width screens) -->
				<div class="block xs:hidden">
					<div
						class="absolute left-0 flex justify-between w-full gap-1 px-2 bottom-2"
					>
						<div class="dropdown dropdown-hover dropdown-right dropdown-top">
							<button type="button">
								<img
									src={data.session?.user?.image}
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
										await signOut({
											redirect: false,
											callbackUrl: '/?logout=true'
										})}
									>Log out
									<iconify-icon icon="mingcute:exit-line" class="text-2xl" />
								</button>
							</ul>
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
					</div>
				</div>
			</div>
		</aside>
	</div>

	<!-- Upper navbar -->
	<div class="nav__flex__container max-w-[100vw]">
		<nav
			class="flex items-center max-w-[100vw] gap-2 px-4 py-2 border-b-2 border-light_text_black_20"
		>
			<!-- Hamburger menu -->
			<button
				on:click={() => (isSidebarShown = !isSidebarShown)}
				class="block mr-auto md:hidden"
				type="button"
			>
				<iconify-icon icon="charm:menu-hamburger" class="text-3xl" />
			</button>

			<!-- Upper part navigation -->
			<div class="max-w-[70vw] md:max-w-[50vw] mr-auto text-sm breadcrumbs">
				<ul>
					{#each pathname as segment, index}
						{@const routeSegment = route
							? routeNameChanges[
									route[index].substring(1, route[index].length - 1)
							  ]
							: undefined}
						{#if !['', 'edit', 'delete'].includes(segment)}
							<li>
								<a
									href={getBreadcrumbsPath(index)}
									class={pathname[pathname.length - 1] === segment
										? 'text-light_primary dark:text-dark_primary'
										: ''}
								>
									{#if routeSegment}
										{routeSegment}
									{:else}
										{segment.replace('-', ' ')[0].toUpperCase() +
											segment.replaceAll('-', ' ').slice(1, segment.length)}
									{/if}
								</a>
							</li>
						{:else}
							<li>
								{segment.replace('-', ' ')[0].toUpperCase() +
									segment.replaceAll('-', ' ').slice(1, segment.length)}
							</li>
						{/if}
					{/each}
				</ul>
			</div>

			<!-- Dark mode and account for large screens -->
			<div class="items-center hidden gap-4 xs:flex">
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
								await signOut({
									redirect: false,
									callbackUrl: '/?logout=true'
								})}
							>Log out
							<iconify-icon icon="mingcute:exit-line" class="text-2xl" />
						</button>
					</ul>
				</div>
			</div>
		</nav>
		<!-- px-4 pt-6 md:px-8 xl:px-16 -->
		<div class="relative flex-1 px-2 md:px-0">
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

	@media (max-width: 768px) {
		.grid__layout {
			grid-template-columns: 0px 1fr;
		}
	}

	/* .grid__layout.layout__hidden {
		grid-template-columns: 0px 1fr;
	}

	@media (max-width: 1024px) {
		.grid__layout {
			grid-template-columns: 0px 1fr;
		}
	} */

	:global(.dark) .active {
		background-color: var(--dark-primary) !important;
		color: var(--dark-text-white) !important;
	}

	.active {
		background-color: var(--light-primary) !important;
		color: var(--light-white) !important;
	}

	.nav__flex__container {
		display: flex;
		flex-direction: column;
	}
</style>
