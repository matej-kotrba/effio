<script lang="ts">
	import type { Tag } from '@prisma/client';

	export let tag: Tag;
</script>

<span
	class="px-2 py-1 text-xs text-center border-r-4 border-solid rounded-sm shadow-sm bg-light_grey text-light_text_black_60 dark:bg-dark_grey dark:text-dark_text_white"
	style={`border-color: ${tag.color}`}>{tag.name}</span
>
