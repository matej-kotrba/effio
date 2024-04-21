<script context="module" lang="ts">
	export type MetaTagsProps = {
		title: string;
		description: string;
	};
</script>

<script lang="ts">
	export let data: MetaTagsProps;
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
</svelte:head>
