<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { TestRecord, TestVersion } from '@prisma/client';
	import { goto } from '$app/navigation';
	import { transformDate } from '~/lib/utils/date.js';

	export let data;

	type RecordType = TestRecord & {
		test: TestVersion;
	};

	const RECODS_PER_PAGE = 10;
	let currentPage = 0;

	let records: RecordType[] = [];
	let isFetching = true;

	async function getNewPageRecords(index: number) {
		if (index === currentPage) return;
		if (!data?.session?.user?.id) return;

		const recordsData = await trpc($page).records.getUserRecords.query({
			id: data?.session?.user?.id,
			limit: RECODS_PER_PAGE,
			skip: RECODS_PER_PAGE * index
		});

		if (recordsData.success && recordsData.records.length > 0) {
			currentPage = index;
			records = recordsData.records;
		}
	}

	onMount(async () => {
		if (!data?.session?.user?.id) return;
		isFetching = true;

		const recordsResponse = await trpc($page).records.getUserRecords.query({
			id: data?.session?.user?.id,
			limit: RECODS_PER_PAGE
		});

		records = recordsResponse.records;
		isFetching = false;
	});
</script>

<DashboardTitle
	title="Test History"
	subtitle="Browser through your test records."
/>

{#if isFetching}
	<div class="flex justify-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:else}
	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr class="dark:text-dark_text_white">
					<th>Name</th>
					<th>Taken at</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->

				{#each records as record}
					<tr
						class="cursor-pointer hover:bg-base-200 dark:hover:bg-dark_text_white_20 dark:text-dark_text_white"
						on:click={() => {
							goto('/dashboard/test-history/records/' + record.id);
						}}
					>
						<td>{record.title}</td>
						<td>{transformDate(record.createdAt)}</td>
						<td class="max-w-lg overflow-hidden text-ellipsis whitespace-nowrap"
							>{record.description}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		{#await data.streaming.recordsCount then count}
			{#if count === 0}
				<div class="flex flex-col items-center justify-center">
					<h6 class="text-center">No test records exist.</h6>
					<iconify-icon
						icon="solar:mask-sad-linear"
						class="grid text-4xl place-content-center text-light_text_black_20 dark:text-dark_text_white_20"
					/>
				</div>
			{:else}
				<!-- Pagination controls -->
				<div class="flex flex-wrap gap-1 mt-4">
					{#if 3 - currentPage < 0}
						<button
							type="button"
							class={`btn btn-ghost duration-0 aspect-square`}
							on:click={() => {
								getNewPageRecords(0);
							}}
						>
							{1}
						</button>
						<div class="self-end">...</div>
					{/if}
					<button
						type="button"
						class="btn btn-ghost duration-0 aspect-square"
						disabled={currentPage === 0}
						on:click={() => {
							if (currentPage === 0) return;
							getNewPageRecords(currentPage - 1);
						}}
					>
						<iconify-icon
							icon="iconamoon:arrow-left-2-light"
							class="grid text-3xl place-content-center"
						/>
					</button>
					{#each Array(Math.ceil(count / RECODS_PER_PAGE)) as _, index}
						{#if Math.abs(currentPage - index) <= 3}
							<button
								type="button"
								class={`btn btn-ghost duration-0 aspect-square ${
									index === currentPage
										? 'bg-light_primary dark:bg-dark_primary text-white hover:bg-light_primary'
										: ''
								}`}
								on:click={() => {
									getNewPageRecords(index);
								}}
							>
								{index + 1}
							</button>
						{/if}
					{/each}
					<button
						type="button"
						class="btn btn-ghost duration-0 aspect-square"
						disabled={currentPage === Math.ceil(count / RECODS_PER_PAGE) - 1}
						on:click={() => {
							getNewPageRecords(currentPage + 1);
						}}
					>
						<iconify-icon
							icon="iconamoon:arrow-left-2-light"
							rotate="180deg"
							class="grid text-3xl place-content-center"
						/>
					</button>
					{#if Math.ceil(count / RECODS_PER_PAGE) - currentPage > 4}
						<div class="self-end">...</div>
						<button
							type="button"
							class={`btn btn-ghost duration-0 aspect-square`}
							on:click={() => {
								if (currentPage === Math.ceil(count / RECODS_PER_PAGE) - 1)
									return;
								getNewPageRecords(Math.ceil(count / RECODS_PER_PAGE) - 1);
							}}
						>
							{Math.ceil(count / RECODS_PER_PAGE)}
						</button>
					{/if}
				</div>
			{/if}
		{/await}
	</div>
{/if}
