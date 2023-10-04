<script>
	import { page } from '$app/stores';

	export let data;
</script>

<!-- <h3 class="font-semibold text-h3">{data.group.name}</h3> -->
<div class="grid__container">
	<div class="">
		<ul
			class="w-[200px] min-h-full border-r-2 border-solid menu border-light_text_black_20 dark:border-dark_text_white_20 py-8 sidebar"
		>
			<li class="font-semibold text-body1">
				{data.group.name}
			</li>
			{#each data.group['groupsSubcategories'] as category}
				<li>
					<a href="/dashboard/my-groups/{data.group.slug}/{category.slug}">
						{category.name}
					</a>
				</li>
			{/each}
		</ul>
	</div>
	<div class="relative max-h-[calc(100vh-70px)] overflow-x-scroll">
		<slot />
	</div>
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 180px 1fr;
	}
</style>
