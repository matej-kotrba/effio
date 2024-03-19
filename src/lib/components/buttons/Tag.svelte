<script lang="ts">
	import type { Tag } from '@prisma/client';
	import { twMerge } from 'tailwind-merge';

	export let tag: Tag;
	export let isToggable = false;
	export let toggledClasses = '';

	let classes = '';
	export { classes as class };

	let isToggled = false;

	function toggle() {
		isToggled = !isToggled;
	}
</script>

<button
	type="button"
	on:click={toggle}
	class={twMerge(
		`${
			isToggable
				? isToggled
					? toggledClasses
					: 'w-0 p-0 border-r-[16px] cursor-pointer'
				: 'px-2 py-1 border-r-4 cursor-default'
		} overflow-hidden duration-200 text-xs text-center border-solid rounded-sm shadow-sm bg-light_grey text-light_text_black_60 dark:bg-dark_grey dark:text-dark_text_white whitespace-nowrap overflow-ellipsis`,
		classes
	)}
	style={`border-color: ${tag.color}`}>{tag.name}</button
>
