<script lang="ts">
	import SearchBar from '~components/inputs/SearchBar.svelte';
	import FilterButton from '~components/inputs/FilterButton.svelte';

	let searchQuery: string = '';

	function searchFunction(value: string) {
		searchQuery = value;
	}
</script>

<div class="flex items-center justify-center gap-2">
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
