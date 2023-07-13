<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Test, TestRecord } from '@prisma/client';

	export let data;

	type RecordType = TestRecord & {
		test: Test;
	};

	let records: RecordType[] = [];

	onMount(async () => {
		if (!data?.session?.user?.id) return;

		const recordsResponse = await trpc($page).records.getUserRecords.query({
			id: data?.session?.user?.id
		});

		records = recordsResponse.records as unknown as RecordType[];
	});
</script>

<DashboardTitle
	title="Test History"
	subtitle="Browser through your test records."
/>

{#each records as record}
	<p>{record.test.title}</p>
{/each}
