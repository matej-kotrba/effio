<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };

	const dispatch = createEventDispatcher();

	let textAreaRef: HTMLTextAreaElement;

	function onInput() {
		textAreaRef.style.height = 'auto';
		textAreaRef.style.height = `${textAreaRef.scrollHeight}px`;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && e.shiftKey === false && e.ctrlKey === false) {
			e.preventDefault();
			submitContent();
		}
	}

	function submitContent() {
		dispatch('chatSubmit', textAreaRef.value);
	}

	onMount(() => {
		textAreaRef.style.height = `${textAreaRef.scrollHeight}px`;
	});
</script>

<div class={twMerge('fixed w-full max-w-full shadow z-10', classes)}>
	<textarea
		bind:this={textAreaRef}
		rows="1"
		class="w-full px-2 py-2 duration-150 rounded-md resize-none max-h-[380px] focus-within:outline-light_primary outline-2 outline outline-transparent"
		on:input={onInput}
		on:keydown={onKeyDown}
	/>
</div>
