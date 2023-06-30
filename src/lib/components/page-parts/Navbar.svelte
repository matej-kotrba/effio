<nav class="bg-light_quaternary h-[70px]">
	<div class="h-full px-5 grid__container">
		<div class="flex items-center">
			<img src="/imgs/logo.png" alt="Logo" />
		</div>
		<ul class="flex items-center justify-center h-full gap-4 nav__list text-light_text_black">
			<li>Home</li>
			<li>Community</li>
			<li>Login</li>
			<li>About</li>
			<li>Dashboard</li>
			<li>Creator</li>
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

	.nav__list > li {
		height: 100%;
		position: relative;

		display: grid;
		place-content: center;
	}

	.nav__list > li::before {
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

	.nav__list > li:hover::before {
		scale: 1 1;
	}
</style>
