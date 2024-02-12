<script lang="ts">
	import Navbar from '~components/page-parts/Navbar.svelte';

	export let data;
</script>

<Navbar user={data.session} />
<div>
	<slot />
</div>
