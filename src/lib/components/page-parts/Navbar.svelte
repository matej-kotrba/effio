<nav class="bg-light_terciary h-[70px]">
	<div class="h-full px-5 grid__container">
		<div class="flex items-center">
			<img src="/imgs/logo.png" alt="Logo" />
		</div>
		<ul class="flex items-center justify-center h-full gap-2 text-light_text_black">
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
		grid-template-columns: var(--side-col-width) 1fr var(--side-col-width);
	}
</style>
