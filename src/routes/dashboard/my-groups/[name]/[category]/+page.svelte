<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	const subcategory = data.group.groupsSubcategories.find((item) => item.slug);

	if (!subcategory) {
		goto('/dashboard/my-groups/' + data.group.slug);
	}
</script>

{#if subcategory}
	<h4 class="w-full h-24 bg-blue-300">
		{subcategory.name}
	</h4>
{/if}
