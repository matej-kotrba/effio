<script>
	import { page } from '$app/stores';

	export let data;
</script>

<!-- <h3 class="font-semibold text-h3">{data.group.name}</h3> -->
<div class="relative h-full grid__container">
	<div class="relative w-full">
		<ul
			class="max-h-full min-h-full py-8 border-r-2 border-solid menu border-light_text_black_20 dark:border-dark_text_white_20 sidebar"
		>
			<li class="font-semibold text-body1">
				<a
					href="/dashboard/my-groups/{data.group.slug}"
					class:active={$page.url.pathname.split('/').at(-1) ===
						data.group.slug}
				>
					<div class="flex items-center gap-1">
						<iconify-icon icon="ion:home" class="text-2xl" />
						<span>
							{data.group.name}
						</span>
					</div></a
				>
			</li>
			{#each data.group['groupsSubcategories'] as category}
				<li>
					<a
						href="/dashboard/my-groups/{data.group.slug}/{category.slug}"
						class:active={$page.url.pathname.split('/').at(-1) ===
							category.slug}
					>
						{category.name}
					</a>
				</li>
			{/each}
		</ul>
	</div>
	<div class="relative max-h-[calc(100vh-70px)] overflow-scroll">
		<slot />
	</div>
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 200px 1fr;
	}
	.active {
		@apply bg-light_secondary text-white;
	}
</style>
