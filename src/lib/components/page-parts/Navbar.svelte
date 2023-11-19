<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';

	export let user: UpdatedSession | undefined;
	export let includeSeparator = true;
</script>

<nav
	class={`bg-transparent h-[70px] z-[105] backdrop-blur-xl ${
		includeSeparator ? 'border-b-2 border-light_text_black_20' : ''
	} `}
>
	<div class="container flex justify-between h-full px-5 mx-auto">
		<div class="flex items-center h-full logo">
			<a href="/">
				<img src="/imgs/logo.png" alt="Logo" class="w-[70px]" />
			</a>
		</div>
		<ul
			class="flex items-center justify-center h-full gap-2 text-sm uppercase text-light_text_black dark:text-dark_text_white"
		>
			<a
				href="/"
				class="relative px-4 py-2 font-semibold duration-200 rounded-md hover:bg-gray-200 dark:hover:bg-dark_light_grey hover:text-light_primary dark:hover:text-white"
			>
				<li>Home</li>
			</a>
			<a
				href="/dashboard"
				class="relative px-4 py-2 font-semibold duration-200 rounded-md hover:bg-gray-200 dark:hover:bg-dark_light_grey hover:text-light_primary dark:hover:text-white"
			>
				<li>Dashboard</li>
			</a>
			<a
				href="/community"
				class="relative px-4 py-2 font-semibold duration-200 rounded-md hover:bg-gray-200 dark:hover:bg-dark_light_grey hover:text-light_primary dark:hover:text-white"
			>
				<li>Community</li>
			</a>
			{#if !user}
				<a
					href="/login"
					class="relative px-4 py-2 font-semibold text-white duration-200 rounded-md hover:bg-light_primary_dark bg-light_primary"
				>
					<li>Login</li>
				</a>
			{:else}
				<!-- <img src={user?.user?.image} alt="Icon" class="w-10 rounded-full" /> -->
				<div class="dropdown dropdown-end">
					<button tabindex="0" type="button">
						<img src={user?.user?.image} alt="Icon" class="w-10 rounded-full" />
					</button>
					<ul
						class="menu dropdown-content z-[1] p-2 shadow-md bg-base-100 rounded-box w-52 mt-4 gap-1 dark:bg-dark_light_grey"
					>
						<li class="">
							<a
								href="/dashboard/test-collection"
								class="normal-case dark:hover:bg-dark_text_white_20 dark:hover:text-white"
								>My tests</a
							>
						</li>
						<li>
							<button
								on:click={() => {
									signOut();
								}}
								class="dark:hover:bg-dark_text_white_20 dark:hover:text-white"
								><iconify-icon icon="iconamoon:exit-light" class="text-lg" /> Log
								out</button
							>
						</li>
					</ul>
				</div>
			{/if}
		</ul>
	</div>
</nav>

<style>
	.logo:hover {
		animation: rotate 0.4s ease forwards;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
