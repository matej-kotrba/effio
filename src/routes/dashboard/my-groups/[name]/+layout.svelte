<script>
	import { page } from '$app/stores';

	export let data;
</script>

<!-- <h3 class="font-semibold text-h3">{data.group.name}</h3> -->
<div class="grid__container">
	<div class="">
		<ul
			class="w-[200px] min-h-full border-r-2 border-solid menu border-light_text_black_20 dark:border-dark_text_white_20 absolute left-0 top-0 py-8 sidebar"
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
			<!-- <li><a>Item 1</a></li>
		<li>
			<details open>
				<summary>Parent</summary>
				<ul>
					<li><a>level 2 item 1</a></li>
					<li><a>level 2 item 2</a></li>
					<li>
						<details open>
							<summary>Parent</summary>
							<ul>
								<li><a>level 3 item 1</a></li>
								<li><a>level 3 item 2</a></li>
							</ul>
						</details>
					</li>
				</ul>
			</details>
		</li>
		<li><a>Item 3</a></li> -->
		</ul>
	</div>

	<slot />
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 180px 1fr;
	}
</style>
