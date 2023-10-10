<script lang="ts">
	export let side: 'left' | 'right' = 'left';

	const styles = {
		side: `${side}-0`
	};

	let isOpen = false;

	export const open = () => {
		isOpen = true;
	};
</script>

<aside class="fixed {styles.side} top-0 h-full w-80 z-[20] pointer-events-none">
	<div class="relative w-full h-full overflow-hidden">
		<div
			class="bg-light_whiter shadow-md w-full h-full absolute top-0 p-4 duration-150 {isOpen
				? 'right-0'
				: '-right-full'} pointer-events-auto"
		>
			<button
				type="button"
				class="absolute grid content-center -translate-y-1/2 rounded-full pointer-events-auto bg-light_terciary top-1/2 duration-150 {isOpen
					? 'right-[calc(100%-0.5rem)] translate-x-full rotate-180'
					: 'right-[calc(100%+0.5rem)]'}"
				on:click={open}
			>
				<iconify-icon icon="iconamoon:arrow-left-2-bold" class="text-5xl" />
			</button>
			<button
				type="button"
				class="grid text-light_text_black place-content-center"
				on:click={() => {
					isOpen = false;
				}}
			>
				<iconify-icon icon="ic:round-close" class="text-3xl" />
			</button>
		</div>
	</div>
</aside>
