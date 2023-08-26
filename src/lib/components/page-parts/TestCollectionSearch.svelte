<script lang="ts">
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import FilterButton from '~components/inputs/FilterButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';

	let searchQuery: string = '';
	let tests = [];

	function searchFunction(value: string) {
		searchQuery = value;
	}

	// TODO: DOdělat tohle
	async function getTests() {
		const data = await trpc($page).getUserTestsById.query({
			// @ts-ignore
			id: $page.data.session?.user?.id,
			limit: 4
		});
	}
</script>

<div class="flex items-center justify-center gap-2 px-12">
	<SearchBar {searchFunction} />
	<FilterButton
		options={[
			{
				value: 'Date'
			},
			{
				value: 'Stars'
			}
		]}
	/>
</div>
<Space />
<div>
	{#if tests.length === 0}
		<div class="flex flex-col items-center gap-1">
			<iconify-icon
				icon="solar:mask-sad-linear"
				class="text-8xl text-light_text_black_20 dark:text-dark_text_white_20"
			/>
			<p class="text-light_text_black_40 dark:text-dark_text_white_40">
				No tests here, go fix that!
			</p>
			<a
				href="/dashboard/test-creator"
				class="text-xs btn dark:bg-dark_light_grey dark:text-dark_text_white_80 dark:border-dark_light_grey dark:hover:bg-dark_grey dark:hover:border-dark_grey"
				>Create your first test!</a
			>
		</div>
	{:else}
		Tady budou testy
	{/if}
</div>
<Space />
