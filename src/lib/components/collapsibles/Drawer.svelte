<script lang="ts">
	import Space from '~components/separators/Space.svelte';

	export let side: 'left' | 'right' = 'left';

	const styles = {
		side: `${side}-0`
	};

	let isOpen = true;

	export const open = () => {
		isOpen = true;
	};

	export const close = () => {
		isOpen = false;
	};
</script>

<aside class="fixed {styles.side} top-0 h-full w-80 z-[20] pointer-events-none">
	<div class="relative w-full h-full">
		<div
			class="bg-light_whiter shadow-md w-full h-full absolute top-0 p-3 duration-150 {isOpen
				? 'right-0'
				: '-right-full'} pointer-events-auto
				flex flex-col"
		>
			<button
				type="button"
				class="absolute grid content-center -translate-y-1/2 pointer-events-auto bg-light_terciary top-1/2 duration-150 {isOpen
					? 'right-[calc(100%)] '
					: 'right-[calc(100%)]'}
          before:content-[''] before:absolute before:bottom-full before:left-0 before:w-full before:h-full before:bg-light_terciary before:rounded-tl-4xl
          after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-full after:bg-light_terciary after:rounded-bl-4xl"
				on:click={isOpen ? close : open}
			>
				<iconify-icon
					icon="iconamoon:arrow-left-2-bold"
					class="text-4xl {isOpen ? 'rotate-180' : ''} duration-150"
				/>
			</button>
			<button
				type="button"
				class="grid mr-auto text-light_text_black place-content-center group"
				on:click={() => {
					isOpen = false;
				}}
			>
				<iconify-icon
					icon="ic:round-close"
					class="text-3xl group-hover:text-error"
				/>
			</button>
			<Space gap={5} />
			<div class="relative max-h-full pr-4 overflow-y-scroll">
				<slot />
			</div>
		</div>
	</div>
</aside>

<!-- <style>
	.shader {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(
			to right,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 1) 100%
		);
	}

	.shader_flipped {
		background-image: linear-gradient(
			to left,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 1) 100%
		);
		bottom: 0;
		top: none;
	}
</style> -->
