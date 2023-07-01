<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<nav class="bg-transparent h-[70px] container mx-auto">
	<div class="flex justify-between h-full px-5">
		<div class="flex items-center h-full">
			<img src="/imgs/logo.png" alt="Logo" class="w-[70px]" />
		</div>
		<ul class="flex items-center justify-center h-full gap-6 nav__list text-light_text_black">
			<a href="#" class="relative flex flex-col items-center justify-center h-full">
				<Icon icon="heroicons:home-solid" class="text-2xl" />
				<li>Home</li>
			</a>
			<a href="#" class="relative flex flex-col items-center justify-center h-full">
				<Icon icon="fluent:people-community-24-filled" class="text-2xl" />
				<li>Community</li>
			</a>
			<a href="#" class="relative flex flex-col items-center justify-center h-full">
				<Icon icon="wpf:unlock-2" class="text-2xl" />
				<li>Login</li>
			</a>
			<a href="#" class="relative flex flex-col items-center justify-center h-full">
				<Icon icon="fluent:info-24-filled" class="text-2xl" />
				<li>About</li>
			</a>
			<a href="#" class="relative flex flex-col items-center justify-center h-full">
				<Icon icon="foundation:graph-pie" class="text-2xl" />
				<li>Dashboard</li>
			</a>
		</ul>
	</div>
</nav>

<style>
	.grid__container {
		--side-col-width: 70px;

		display: grid;
		grid-template-columns: 1fr 3fr 1fr;
	}

	.grid__container img {
		width: var(--side-col-width);
	}

	.nav__list a::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 3px;
		border-radius: 50px;
		background-color: var(--light-primary);
		bottom: 0;
		left: 0;
		scale: 0 1;
		transform-origin: center;
		transition: 200ms;
	}

	.nav__list a:hover::before {
		scale: 1 1;
	}
</style>
