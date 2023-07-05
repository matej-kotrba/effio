<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';

	type Inputs = {
		name: string;
	};

	export let inputs: Inputs[];

	export { classes as class };
	let classes = '';

	const dispatch = createEventDispatcher();

	let isDragging = false;

	function onDragEvent() {
		dispatch('drag', { isDragging });
	}
</script>

<div class="relative">
	<div
		class="sticky top-0 flex flex-col gap-2 p-2 {classes}"
		use:dndzone={{
			items: inputs,
			flipDurationMs: 300,
			dropTargetClasses: ['outline-light_primary', 'outline-solid', 'rounded-md'],
			dropTargetStyle: {
				outline: '2px dashed var(--light-primary)'
			}
		}}
	>
		{#each inputs as input, index (index)}
			<div
				on:dragstart={onDragEvent}
				on:dragend={onDragEvent}
				class="grid w-full bg-white rounded-md shadow-md shadow-light_text_black_40 aspect-square place-content-center"
			>
				{input.name}
			</div>
		{/each}
	</div>
</div>
