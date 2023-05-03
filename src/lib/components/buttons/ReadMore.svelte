<script lang="ts">
	export let link: `#${string}` = '#';
</script>

<a
	href={link}
	class="px-8 py-4 text-2xl duration-150 rounded-md shadow-lg bg-light_primary h-fit text-light_white hover:translate-y-1"
	>Read more</a
>

<style>
	a {
		scroll-behavior: smooth;
	}

	a:hover {
		box-shadow: 0 0 20px rgba(101, 51, 240, 0.6);
	}
</style>
