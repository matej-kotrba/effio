<script lang="ts">
	export let text: string = 'Call to Action';
	export let center: 'left' | 'center' | 'right' = 'center';

	let centerString = 'mx-auto';
	if (center == 'left') centerString = 'mr-auto';
	if (center == 'right') centerString = 'ml-auto';
</script>

<button
	type="button"
	class="flex items-center gap-2 px-10 py-4 font-medium text-white rounded-full shadow-xl text-h4 {centerString}"
	>{text}<slot /></button
>

<style>
	button {
		background-image: radial-gradient(
				circle at right,
				hsla(256, 100%, 79%, 0.8),
				hsla(258, 100%, 61%, 0.5)
			),
			radial-gradient(circle at left, rgba(112, 29, 255, 0.5), hsla(0, 0%, 100%, 0.5));
		background-position: center;
		background-size: 100% 100%;
		transition: 0.3s ease;
	}
	button:hover {
		background-size: 200% 200%;
	}
</style>
