<script lang="ts">
	import MetaTags from '~components/other/MetaTags.svelte';

	export let data;
</script>

<MetaTags data={data.meta} />
<slot />
