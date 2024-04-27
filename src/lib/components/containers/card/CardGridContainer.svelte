<div class="grid__container">
	<slot />
</div>

<style>
	.grid__container {
		display: grid;
		gap: 12px;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		place-content: center;
	}
	@media screen and (min-width: 768px) {
		.grid__container {
			place-content: start;
		}
	}
</style>
