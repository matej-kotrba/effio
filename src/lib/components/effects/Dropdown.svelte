<script lang="ts">
	import { onMount } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	export let directionY: 'top' | 'bottom' = 'top';
	export let directionX: 'left' | 'right' | 'center' = 'right';

	export let dropdownStyles: string = '';
	export let dropdownButtonStyles: string = '';

	let directionXStyle = '';
	let directionYStyle = '';

	let classes = '';
	export { classes as class };

	function initializeSettings() {
		switch (directionX) {
			case 'left':
				directionXStyle = 'left-0';
				break;
			case 'right':
				directionXStyle = 'right-0';
				break;
			case 'center':
				directionXStyle = 'left-[50%] translate-x-[-50%]';
				break;
		}

		switch (directionY) {
			case 'top':
				directionYStyle = 'bottom-[100%]';
				break;
			case 'bottom':
				directionYStyle = 'top-[100%]';
				break;
		}
	}

	function onClick() {}

	onMount(() => {
		initializeSettings();
	});
</script>

<div class={twMerge('relative inline-block', classes)}>
	<button
		type="button"
		on:click={onClick}
		class={twMerge('p-2', dropdownButtonStyles)}
	>
		<slot name="title" />
	</button>
	<div
		class={twMerge(
			`absolute p-2 bg-light_text_black text-whiter z-[6] ${directionXStyle} ${directionYStyle}`,
			dropdownStyles
		)}
	>
		<slot name="content" />
	</div>
</div>
