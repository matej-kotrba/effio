<script lang="ts">
	export let text: string = 'Call to Action';
	export let center: 'left' | 'center' | 'right' = 'center';
	export let link: string = '#';

	let centerString = 'mx-auto';
	if (center == 'left') centerString = 'mr-auto';
	if (center == 'right') centerString = 'ml-auto';
</script>

<a
	href={link}
	class="w-fit flex items-center gap-2 px-10 py-4 font-semibold text-white rounded-full shadow-xl text-h4 {centerString}"
	>{text}<slot /></a
>

<style>
	a {
		/* background-image: radial-gradient(
				circle at right,
				hsla(256, 100%, 79%, 0.8),
				hsla(258, 100%, 61%, 0.5)
			),
			radial-gradient(circle at left, rgba(112, 29, 255, 0.5), hsla(0, 0%, 100%, 0.5)); */
		background-image: linear-gradient(240deg, #6433f0, #61bdff);
		background-position: center;
		background-size: 150% 150%;
		transition: 0.5s ease background-position;
	}
	a:hover {
		background-position: right top;
	}
</style>
