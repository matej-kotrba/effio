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

<div
	class={twMerge(
		'group fixed w-full max-w-full shadow z-10 flex items-start bg-white focus-within:outline-light_secondary duration-100 outline-2 outline outline-transparent rounded-l-md rounded-br-md rounded-tr-none',
		classes
	)}
>
	<div
		class="absolute w-[60px] h-[30px] bg-white right-0 bottom-[calc(100%+2px)] outline-2 group-focus-within:outline-light_secondary duration-100 outline-transparent rounded-t-md input__out_box"
	/>
	<textarea
		bind:this={textAreaRef}
		rows="1"
		class="w-full px-2 py-2 duration-150 rounded-l-md resize-none max-h-[380px] outline-none"
		on:input={onInput}
		on:keydown={onKeyDown}
	/>
	<button
		type="button"
		on:click={submitContent}
		class="grid h-[43px] bg-white place-content-center rounded-r-md px-2 group"
	>
		<iconify-icon
			icon="mingcute:send-plane-fill"
			class="text-3xl duration-100 text-light_text_black group-hover:text-light_primary"
		/>
	</button>
</div>

<style>
	.input__out_box::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 2px;
		top: 100%;
		left: 0;
		background-color: white;
	}
</style>
