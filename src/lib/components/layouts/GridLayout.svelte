<script lang="ts">
	import HoverLeaning from '../effects/HoverLeaning.svelte';

	export let color: string = 'bg-light_secondary';
</script>

<section>
	<div class="a">
		<HoverLeaning>
			<div class="card">
				<slot name="a" class={color?.startsWith('bg-') ? color : `bg-[${color}]`} />
			</div>
		</HoverLeaning>
	</div>
	<div class="b">
		<HoverLeaning>
			<div class="card">
				<slot name="b" class={color?.startsWith('bg-') ? color : `bg-[${color}]`} />
			</div>
		</HoverLeaning>
	</div>
	<div class="c">
		<HoverLeaning>
			<div class="card">
				<slot name="c" class={color?.startsWith('bg-') ? color : `bg-[${color}]`} />
			</div>
		</HoverLeaning>
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
	section .card {
		height: 100%;
		border-radius: 40px;
		padding: 40px;
		@apply bg-light_secondary;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.299);
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
