<section>
	<div class="a">
		<slot name="a" />
	</div>
	<div class="b">
		<slot name="b" />
	</div>
	<div class="c">
		<slot name="c" />
	</div>
</section>

<style>
	section {
		height: 700px;
		display: grid;
		gap: 40px;
		grid-template-areas:
			'a a b b b'
			'a a c c c';
	}
	section > div {
		border-radius: 40px;
		padding: 40px;
		@apply bg-light_secondary;
	}
	.a {
		grid-area: a;
	}
	.b {
		grid-area: b;
	}
	.c {
		grid-area: c;
	}
</style>
