<script lang="ts">
	import { onMount } from 'svelte';

	export let directionY: 'top' | 'bottom' = 'top';
	export let directionX: 'left' | 'right' | 'center' = 'right';

	export let dropdownStyles: string = '';

	let directionXStyle = '';
	let directionYStyle = '';

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

<div class="relative inline-block">
	<button type="button" on:click={onClick} class="p-2">
		<slot name="title" />
	</button>
	<div
		class="absolute p-2 bg-light_text_black text-whiter {directionXStyle} {directionYStyle} {dropdownStyles}"
	>
		<slot name="content" />
	</div>
</div>
