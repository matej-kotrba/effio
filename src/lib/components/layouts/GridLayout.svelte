<script lang="ts">
	import HoverLeaning from '../effects/HoverLeaning.svelte';

	export let color: string = 'bg-light_secondary';
	export let darkColor: string = 'bg-dark_secondary';
</script>

<!-- class={`card ${color?.startsWith('bg-') ? color : `bg-[${color}]`} ${
					darkColor?.startsWith('bg-')
						? 'dark:' + darkColor
						: `dark:bg-[${darkColor}]`
				}`} -->
<section>
	<div class="a">
		<HoverLeaning>
			<div class="card bg-light_secondary dark:bg-dark_secondary">
				<slot name="a" />
			</div>
		</HoverLeaning>
	</div>
	<div class="b">
		<HoverLeaning>
			<div class="card bg-light_secondary dark:bg-dark_secondary">
				<slot name="b" />
			</div>
		</HoverLeaning>
	</div>
	<div class="c">
		<HoverLeaning>
			<div class="card bg-light_secondary dark:bg-dark_secondary">
				<slot name="c" />
			</div>
		</HoverLeaning>
	</div>
</section>

<style>
	section {
		max-height: 700px;
		display: grid;
		gap: 40px;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}
	section .card {
		height: 100%;
		border-radius: 40px;
		padding: 40px;
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
