<script lang="ts" context="module">
	export const AUTHENTICATED_NAV_HEIGHT = 70;
</script>

<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import { signOut } from '@auth/sveltekit/client';
	import { fly } from 'svelte/transition';
	import DashboardSidebarWrapper from '~components/navigation/dashboard/DashboardSidebarWrapper.svelte';
	import Breadcrumbs from '~components/navigation/Breadcrumbs.svelte';

	export let data;

	let isSidebarShown = false;
	let setIsSidebarShown: (value: boolean) => void;
</script>

<DashboardSidebarWrapper
	bind:setSidebarShown={setIsSidebarShown}
	{isSidebarShown}
	session={data.session}
	links={[
		{
			title: 'Overview',
			icon: 'foundation:graph-pie',
			href: 'dashboard'
		},
		{
			title: 'Create a new test',
			icon: 'system-uicons:create',
			href: 'dashboard/test-creator'
		},
		{
			title: 'Test collection',
			icon: 'heroicons-solid:collection',
			href: 'dashboard/test-collection'
		},
		{
			title: 'Test History',
			icon: 'ic:round-history',
			href: 'dashboard/test-history'
		},
		{
			title: 'My Groups',
			icon: 'ion:share-social',
			href: 'dashboard/my-groups'
		},
		{
			title: 'Community place',
			icon: 'fluent:people-community-24-filled',
			href: 'community'
		}
	]}
>
	<!-- Upper navbar -->
	<div class="nav__flex__container max-w-[100vw]">
		<nav
			style={`height: ${AUTHENTICATED_NAV_HEIGHT}px;`}
			class="flex items-center max-w-[100vw] gap-2 px-4 py-2 border-b-2 border-light_text_black_10"
		>
			<!-- Hamburger menu -->
			<button
				on:click={() => {
					setIsSidebarShown(!isSidebarShown);
				}}
				class="block mr-auto md:hidden"
				type="button"
			>
				<iconify-icon icon="charm:menu-hamburger" class="text-3xl" />
			</button>

			<!-- Upper part navigation -->
			<Breadcrumbs class="mr-auto" />
			<!-- <div class="max-w-[70vw] md:max-w-[50vw] mr-auto text-sm breadcrumbs">
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
			</div> -->

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
</DashboardSidebarWrapper>

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

	.nav__flex__container {
		display: flex;
		flex-direction: column;
	}
</style>
