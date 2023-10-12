<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import Limit from '~components/informatic/Limit.svelte';

	let classes = '';
	export { classes as class };
	export let limit:
		| {
				min: number;
				max: number;
		  }
		| undefined = undefined;

	const dispatch = createEventDispatcher();

	export let textAreaRef: HTMLTextAreaElement;

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
		'group fixed w-full max-w-full shadow z-10 flex items-start bg-white dark:bg-dark_light_grey focus-within:outline-light_secondary dark:focus-within:outline-dark_secondary duration-100 outline-2 outline outline-transparent rounded-l-md rounded-br-md rounded-tr-none',
		classes
	)}
>
	{#if limit && textAreaRef}
		<div
			class="absolute px-2 py-1 w-16 grid place-content-center bg-white dark:bg-dark_light_grey
			 right-0 bottom-[calc(100%+2px)] outline-2 outline group-focus-within:outline-light_secondary
			 dark:group-focus-within:outline-dark_secondary outline-transparent duration-100 rounded-t-md input__out_box"
		>
			<Limit
				min={limit.min}
				max={limit.max}
				current={textAreaRef.value.length}
			/>
		</div>
	{/if}
	<textarea
		bind:this={textAreaRef}
		rows="1"
		minlength={limit?.min}
		maxlength={limit?.max}
		class="w-full dark:bg-dark_light_grey px-2 py-2 duration-150 rounded-l-md resize-none max-h-[380px] outline-none text-body1"
		on:input={onInput}
		on:keydown={onKeyDown}
	/>
	<button
		type="button"
		on:click={submitContent}
		class="grid h-[43px] bg-white dark:bg-dark_light_grey place-content-center rounded-r-md px-2 group/container"
	>
		<iconify-icon
			icon="mingcute:send-plane-fill"
			class="text-3xl duration-100 text-light_text_black group-hover/container:text-light_primary dark:text-dark_text_white dark:group-hover/container:text-dark_primary"
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

	:global(.dark) .input__out_box::before {
		background-color: var(--dark-light_grey);
	}
</style>
