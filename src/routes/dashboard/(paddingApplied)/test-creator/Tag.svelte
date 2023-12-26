<script lang="ts">
	import type { Tag } from '@prisma/client';

	export let tag: Tag;
	export let isSelected: boolean;
	export let onSelect: (tag: Tag) => void;
</script>

<button
	type="button"
	style={`--color: ${tag.color}`}
	class={`w-full h-fit relative after:content-[''] after:absolute after:right-0 after:top-0 after:-translate-x-1/4 
	after:-translate-y-1/2 after:w-4 after:aspect-square after:rounded-full after:z-10 after:border-[1px] after:border-solid after:border-light_text_black_20
	after:dark:border-dark_text_white
	py-2 duration-100 border-2 border-solid rounded-md whitespace-nowrap 
	 ${
			isSelected
				? 'bg-light_terciary text-white border-light_primary dark:bg-dark_secondary dark:border-dark_primary'
				: 'bg-light_grey hover:bg-light_grey_dark border-light_text_black_20 dark:bg-dark_light_grey dark:border-dark_text_white_20 dark:hover:bg-dark_terciary'
		}`}
	on:click={() => onSelect(tag)}
>
	<span class="relative block w-full overflow-hidden overflow-ellipsis">
		{tag.name}
	</span>
</button>

<style>
	button::after {
		background-color: var(--color, #000);
	}
</style>
