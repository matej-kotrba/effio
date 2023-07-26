<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const REQUEST_AMOUNT = 8;

	const displayedTests = [];

	onMount(async () => {
		const tests = await trpc($page).getPopularTests.query({
			take: REQUEST_AMOUNT
		});
		console.log(tests);
	});
</script>

asdasd
