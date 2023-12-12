<script lang="ts">
	import Navbar from '~components/page-parts/Navbar.svelte';
	import Space from '~components/separators/Space.svelte';

	export let data;
</script>

<Navbar user={data.session} />
<Space gap={40} />
<div
	class="container px-2 mx-auto text-light_text_black dark:text-dark_text_white"
>
	<slot />
</div>
