<script lang="ts">
	export let text: string = 'Call to Action';
	export let center: 'left' | 'center' | 'right' = 'center';

	let centerString = 'mx-auto';
	if (center == 'left') centerString = 'mr-auto';
	if (center == 'right') centerString = 'ml-auto';
</script>

<button
	type="button"
	class="flex items-center gap-2 px-12 py-4 font-medium text-white rounded-full shadow-xl text-h3 {centerString}"
	>{text}<slot /></button
>

<style>
	button {
		background-image: linear-gradient(to right, #c2a5ff, #6c63ff);
	}
</style>
