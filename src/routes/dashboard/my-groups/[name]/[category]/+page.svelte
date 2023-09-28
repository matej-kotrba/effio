<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { trpc } from '~/lib/trpc/client.js';
	import { transformDate } from '~/lib/utils/date';

	export let data;

	let tests: Awaited<
		ReturnType<
			ReturnType<typeof trpc>['groups']['getSubcategoryTestsById']['query']
		>
	> = [];

	const subcategory = data.group.groupsSubcategories.find((item) => item.slug);

	if (!subcategory) {
		goto('/dashboard/my-groups/' + data.group.slug);
	}

	onMount(async () => {
		const categoryId = data.group.groupsSubcategories.find(
			(item) => item.slug === $page.url.pathname.split('/').at(-1)
		)?.id;
		if (categoryId === undefined) {
			goto('/dashboard/my-groups/' + data.group.slug);
		} else {
			const fetchedTests = await trpc(
				$page
			).groups.getSubcategoryTestsById.query({
				id: categoryId
			});

			tests = fetchedTests;
		}
	});
</script>

{#if subcategory}
	<section class="flex flex-col items-center justify-center">
		<img
			aria-hidden="true"
			src="/imgs/svgs/welcome.svg"
			class=""
			width="200"
			alt="decorative"
		/>
		<p class="text-light_text_black_80 dark:text-dark_text_white_80">
			This is the start of the <span
				class="font-semibold text-light_text_black dark:text-dark_text_white"
				>{data.group.name}</span
			> channel.
		</p>
	</section>
	<div class="flex flex-col gap-2 max-w-[800px] mx-auto">
		{#each tests as test}
			<div>
				<span class="text-xs text-light_text_black_60"
					>{transformDate(new Date(test.addedDate))}</span
				>
				<div
					class="flex items-center gap-1 p-2 rounded-sm shadow bg-light_whiter"
				>
					<!-- <div class="h-full">
				<iconify-icon
				icon="raphael:arrowright"
				class="text-2xl text-light_primary"
				/>
			</div> -->
					<div>
						<div class="border-2 border-solid border-light_text_black_40">
							{test.test.title}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
