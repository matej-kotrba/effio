<script lang="ts">
	import Navbar from '~components/page-parts/Navbar.svelte';
	import Space from '~components/separators/Space.svelte';
</script>

<Navbar />
<Space gap={40} />
<div class="container mx-auto text-light_text_black">
	<slot />
</div>
