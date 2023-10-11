<script lang="ts">
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
	<div class="relative w-full h-full overflow-hidden">
		<div
			class="bg-light_whiter shadow-md w-full h-full absolute top-0 p-4 duration-150 {isOpen
				? 'right-0'
				: '-right-full'} pointer-events-auto"
		>
			<button
				type="button"
				class="absolute grid content-center -translate-y-1/2 pointer-events-auto bg-light_terciary top-1/2 duration-150 {isOpen
					? 'right-[calc(100%)] translate-x-full'
					: 'right-[calc(100%)]'}
          before:content-[''] before:absolute before:bottom-full before:left-0 before:w-full before:h-full before:bg-light_terciary {isOpen
					? 'before:rounded-tr-4xl'
					: 'before:rounded-tl-4xl'}
          after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-full after:bg-light_terciary {isOpen
					? 'after:rounded-br-4xl'
					: 'after:rounded-bl-4xl'}"
				on:click={isOpen ? close : open}
			>
				<iconify-icon
					icon="iconamoon:arrow-left-2-bold"
					class="text-4xl {isOpen ? 'rotate-180' : ''} duration-150"
				/>
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
			<div>
				<slot />
			</div>
		</div>
	</div>
</aside>
