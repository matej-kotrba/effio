<script lang="ts">
	import IconButton from '~components/buttons/IconButton.svelte';
	import * as Popover from '~/lib/components/ui/popover/index';
	import Button from '~components/ui/button/button.svelte';
	import AddNew from '~components/testCreator/creatorUtils/AddNew.svelte';
	import Separator from '~components/separators/Separator.svelte';
	type Mock = {
		name: string;
		checked: string;
		color: string;
	};

	// Create 10 mock items
	const mock: Mock[] = [
		{
			name: 'Item 1',
			checked: 'true',
			color: 'red'
		},
		{
			name: 'Item 2',
			checked: 'false',
			color: 'blue'
		},
		{
			name: 'Item 3',
			checked: 'true',
			color: 'green'
		},
		{
			name: 'Item 4',
			checked: 'false',
			color: 'yellow'
		},
		{
			name: 'Item 5',
			checked: 'true',
			color: 'red'
		},
		{
			name: 'Item 6',
			checked: 'false',
			color: 'blue'
		},
		{
			name: 'Item 7',
			checked: 'true',
			color: 'green'
		},
		{
			name: 'Item 8',
			checked: 'false',
			color: 'yellow'
		},
		{
			name: 'Item 9',
			checked: 'true',
			color: 'red'
		},
		{
			name: 'Item 10',
			checked: 'false',
			color: 'blue'
		}
	];

	let usedTagsIdxs: number[] = [];

	let filteredTagsToAdd = mock.filter(
		(_, index) => !usedTagsIdxs.includes(index)
	);

	let open = false;

	function filterTagsToAdd(searchQuery: string) {
		const availableTags = mock.filter((_, index) => {
			return !usedTagsIdxs.includes(index);
		});
		filteredTagsToAdd = availableTags.filter((tag) => {
			return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
		});
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<div class="w-[600px] p-2 m-2 bg-red-300 rounded-md">
			<div class="flex justify-between">
				<p class="mb-1">Tag selection</p>
				<Button
					builders={[builder]}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					><iconify-icon icon="uil:plus" class="text-3xl" /></Button
				>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each mock.filter((item) => item['checked']) as item, i}
					<div
						class="flex items-center gap-2 p-1 pr-4 bg-gray-300 rounded-full shadow-md whitespace-nowrap"
					>
						<IconButton tooltip="Remove" icon="ic:round-close" />
						<span style="color: {item.color}">{item.name}</span>
					</div>
				{/each}
			</div>
		</div>
	</Popover.Trigger>
	<Popover.Content class="max-w-[13rem] p-0">
		<div class="relative flex flex-col overflow-hidden">
			<div class="flex items-center gap-1 p-2">
				<iconify-icon
					icon="ic:round-search"
					class="text-xl text-light_text_black_40 dark:text-dark_text_white_40"
				/>
				<input
					type="text"
					placeholder="Cool tag..."
					class="outline-none text-body2"
					on:change={(e) => filterTagsToAdd(e.target.value)}
				/>
			</div>
			<Separator w="100%" h="1px" />
			<div class="flex flex-col p-1 max-h-[250px] overflow-y-auto">
				{#each filteredTagsToAdd as item}
					<button
						class="px-2 py-1 pl-6 text-left rounded-md text-body2 hover:bg-gray-100"
						>{item.name}</button
					>
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
