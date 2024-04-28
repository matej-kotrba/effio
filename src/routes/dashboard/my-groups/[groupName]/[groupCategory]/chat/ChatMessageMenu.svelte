<script lang="ts">
	import ChatMessageMenuButton from './ChatMessageMenuButton.svelte';
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };
</script>

<div
	class={twMerge(
		'flex rounded-md overflow-hidden border-light_text_black_20 border shadow-none hover:shadow-md duration-100',
		classes
	)}
>
	<ChatMessageMenuButton title="Reply" onClick={() => {}}>
		<iconify-icon icon="bi:reply-fill" class="text-xl" />
	</ChatMessageMenuButton>
	<ChatMessageMenuButton title="Edit" onClick={() => {}}>
		<iconify-icon icon="iconamoon:edit-light" class="text-xl" />
	</ChatMessageMenuButton>
	<ChatMessageMenuButton title="Delete" onClick={() => {}}>
		<iconify-icon
			icon="fluent:delete-28-filled"
			class="text-xl"
		/></ChatMessageMenuButton
	>
</div>
