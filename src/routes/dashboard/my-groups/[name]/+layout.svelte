<script>
	import { page } from '$app/stores';

	export let data;
</script>

<h3 class="font-semibold text-h3">{data.group.name}</h3>
<ul class="w-56 menu rounded-box">
	{#each data.group['groupsSubcategories'] as category}
		<li>
			<a href="/dashboard/my-groups/{data.group.slug}/{category.slug}"
				>{category.name}</a
			>
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
