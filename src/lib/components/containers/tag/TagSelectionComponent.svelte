<script lang="ts">
	import IconButton from '~components/buttons/IconButton.svelte';
	import * as Popover from '~/lib/components/ui/popover/index';
	import Button from '~components/ui/button/button.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import type { Tag } from '@prisma/client';

	export let tags: Tag[] = [];

	let usedTagsSlugs: string[] = ['Item 1', 'Item 7'];

	$: filteredTagsToAdd = tags.filter(
		(item) => !usedTagsSlugs.includes(item.name)
	);

	let open = false;

	function filterTagsToAdd(searchQuery: string) {
		const availableTags = tags.filter((item) => {
			return !usedTagsSlugs.includes(item.name);
		});
		filteredTagsToAdd = availableTags.filter((tag) => {
			return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
		});
	}

	function handleOnInput(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		filterTagsToAdd((e.target as HTMLInputElement).value);
	}

	function onAddTagClick(tag: Tag) {
		usedTagsSlugs = [...usedTagsSlugs, tag.name];
	}

	function onRemoveTagClick(tag: Tag | undefined) {
		if (tag === undefined) return;
		usedTagsSlugs = usedTagsSlugs.filter((item) => item !== tag.name);
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<div class="w-[600px] shadow-md p-2 m-2 bg-light_whiter rounded-sm">
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
				{#each usedTagsSlugs.map((item) => {
					return tags.find((tag) => tag.name === item);
				}) as item, i}
					{#if item !== undefined}
						<div
							class="relative flex items-center gap-2 p-1 pr-4 bg-white rounded-md shadow-sm whitespace-nowrap"
						>
							<div
								class="absolute top-0 right-0 w-1 h-full rounded-r-md"
								style="background-color: {item.color};"
							/>
							<IconButton
								tooltip="Remove"
								icon="ic:round-close"
								class="rounded-lg"
								buttonClasses="text-xl"
								onClick={() => onRemoveTagClick(item)}
							/>
							<span>{item.name}</span>
						</div>
					{/if}
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
					on:input={(e) => handleOnInput(e)}
				/>
			</div>
			<Separator w="100%" h="1px" />
			<div class="flex flex-col p-1 max-h-[250px] overflow-y-auto">
				{#if filteredTagsToAdd.length === 0}
					<p class="text-center text-body2">No tags found</p>
				{/if}
				{#each filteredTagsToAdd as item}
					<button
						type="button"
						on:click={() => onAddTagClick(item)}
						class="px-2 py-1 pl-6 text-left rounded-md text-body2 hover:bg-gray-100"
						>{item.name}</button
					>
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
