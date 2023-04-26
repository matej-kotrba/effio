<script lang="ts">
</script>

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
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}
	section > div {
		border-radius: 40px;
		padding: 40px;
		@apply bg-light_secondary;
	}
	.a {
		grid-column: 1 / 3;
		grid-row: 1 / 3;
	}
	.b {
		grid-column: 3 / 6;
		grid-row: 1;
	}
	.c {
		grid-column: 3 / 6;
		grid-row: 2;
	}
</style>
