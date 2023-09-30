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

	let messages:
		| Awaited<
				ReturnType<
					ReturnType<
						typeof trpc
					>['groups']['getSubcategoryMessagesByGroupSubcategoryId']['query']
				>
		  >
		| 'fetching' = 'fetching';

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

			messages = await trpc(
				$page
			).groups.getSubcategoryMessagesByGroupSubcategoryId.query({
				id: categoryId
			});
		}
	});
</script>

{#if subcategory}
	<section class="flex flex-col items-center justify-center mb-4">
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
		{#if messages === 'fetching'}
			<p>Gettig messages</p>
		{:else}
			{#each messages as message}
				<div>
					<div class="flex items-center gap-1 mb-1">
						<img
							src={message.sender.image}
							alt="User"
							class="w-8 rounded-lg aspect-square"
						/>
						<div class="flex flex-col">
							<span class="text-body2">{message.sender.name}</span>
							<span class="text-body3 text-light_text_black_40">
								{transformDate(message.createdAt, { time: true })}
							</span>
						</div>
					</div>
					<div class="relative p-4 rounded-sm shadow bg-light_whiter">
						<!-- <img
						class="absolute w-10 translate-x-1/2 translate-y-1/2 rounded-full right-full bottom-full aspect-square"
						src={message.sender.image}
						alt="User image"
						/> -->
						<h5 class="text-body1">
							{message.title}
						</h5>
						{#if message.testId && message.test}
							<div
								class="flex flex-col gap-2 p-2 bg-white rounded-md w-fit max-w-[350px] shadow-md shadow-primary test__box"
							>
								{message.test.title}

								<button class="btn w-fit">View</button>
							</div>
						{:else if message.testId}
							<div>Oops, this test can't be accessed anymore.</div>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
		<!-- {#each tests as test}
						<div>
							<span class="text-xs text-light_text_black_60"
							>{transformDate(new Date(test.addedDate))}</span
							>
				<div
					class="flex items-center gap-1 p-2 rounded-sm shadow bg-light_whiter"
				>
					<div class="h-full">
				<iconify-icon
				icon="raphael:arrowright"
				class="text-2xl text-light_primary"
				/>
			</div>
					<div>
						<div class="border-2 border-solid border-light_text_black_40">
							{test.test.title}
						</div>
					</div>
				</div>
			</div>
		{/each} -->
	</div>
{/if}

<style>
</style>
