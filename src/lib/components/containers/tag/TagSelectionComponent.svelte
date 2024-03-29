<script lang="ts">
	import IconButton from '~components/buttons/IconButton.svelte';
	import * as Popover from '~/lib/components/ui/popover/index';
	import Button from '~components/ui/button/button.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import type { Tag } from '@prisma/client';
	import toast from 'svelte-french-toast';
	import { createEventDispatcher } from 'svelte';

	export let tags: Tag[] = [];
	export let usedTagsSlugs: string[] = [];
	export let MAX_TAG_COUNT = 5;

	$: filteredTagsToAdd = tags.filter(
		(item) => !usedTagsSlugs.includes(item.slug)
	);

	const dispatch = createEventDispatcher();
	$: dispatch('tagsChanged', usedTagsSlugs);

	let open = false;

	function filterTagsToAdd(searchQuery: string) {
		const availableTags = tags.filter((item) => {
			return !usedTagsSlugs.includes(item.slug);
		});
		filteredTagsToAdd = availableTags.filter((tag) => {
			return tag.slug.includes(searchQuery.toLowerCase());
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
		if (usedTagsSlugs.length >= MAX_TAG_COUNT) {
			toast.error(`You can't add more than ${MAX_TAG_COUNT} tags`);
			return;
		}
		usedTagsSlugs = [...usedTagsSlugs, tag.slug];
	}

	function onRemoveTagClick(tag: Tag | undefined) {
		if (tag === undefined) return;
		usedTagsSlugs = usedTagsSlugs.filter((item) => item !== tag.slug);
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		{@const usedTags = usedTagsSlugs.map((item) => {
			return tags.find((tag) => tag.slug === item);
		})}
		<div
			class="w-full p-2 my-2 rounded-md shadow-md bg-light_whiter dark:bg-dark_grey"
		>
			<div class="flex justify-between mb-1">
				<div>
					<span>Tag selection</span>
					<span
						class="ml-2 {usedTagsSlugs.length < MAX_TAG_COUNT
							? 'text-light_primary dark:text-dark_primary'
							: 'text-error dark:text-dark_error'}">{usedTagsSlugs.length}</span
					><span class="text-light_text_black_40 dark:text-dark_text_white_40"
						>/{MAX_TAG_COUNT}</span
					>
				</div>
				<Button
					builders={[builder]}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					><iconify-icon icon="uil:plus" class="text-3xl" /></Button
				>
			</div>
			<div class="flex flex-wrap gap-2">
				{#if usedTags.length === 0}
					<span class="text-light_text_black_40 dark:text-dark_text_white_40"
						>No tag added yet!</span
					>
				{/if}
				{#each usedTags as item, i}
					{#if item !== undefined}
						<div
							class="relative flex items-center gap-2 p-1 pr-4 bg-white rounded-md shadow-sm dark:bg-dark_light_grey whitespace-nowrap"
						>
							<div
								class="absolute top-0 right-0 w-1 h-full rounded-r-md"
								style="background-color: {item.color};"
							/>
							<IconButton
								tooltip="Remove"
								icon="ic:round-close"
								class="rounded-lg"
								buttonClasses="text-sm"
								onClick={() => onRemoveTagClick(item)}
							/>
							<span class="text-semiBody1">{item.name}</span>
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
					class="bg-transparent outline-none text-body2"
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
						style="--tag-color: {item.color};"
						class="px-2 py-1 pl-6 text-left rounded-md text-body2 hover:bg-gray-100 dark:hover:bg-zinc-800 relative before:content-[''] before:w-1 before:h-4/5
						 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:rounded-l-md before:bg-[var(--tag-color)]"
						>{item.name}</button
					>
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
