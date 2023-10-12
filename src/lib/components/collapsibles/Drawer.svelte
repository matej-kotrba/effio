<script lang="ts">
	import Space from '~components/separators/Space.svelte';

	export let side: 'left' | 'right' = 'left';
	export let title: string;

	const styles = {
		side: `${side}-0`
	};

	let isOpen = false;

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
			class="bg-light_whiter dark:bg-dark_light_grey shadow-md w-full h-full absolute top-0 p-3 duration-150 {isOpen
				? 'right-0'
				: '-right-full'} pointer-events-auto
				flex flex-col"
		>
			<button
				type="button"
				class="absolute grid content-center -translate-y-1/2 pointer-events-auto bg-light_terciary dark:bg-dark_secondary top-1/2 duration-150 {isOpen
					? 'right-[calc(100%)] '
					: 'right-[calc(100%)]'}
          before:content-[''] before:absolute before:bottom-full before:left-0 before:w-full before:h-full before:dark:bg-dark_secondary before:bg-light_terciary before:rounded-tl-4xl
          after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-full after:dark:bg-dark_secondary after:bg-light_terciary after:rounded-bl-4xl"
				on:click={isOpen ? close : open}
			>
				<iconify-icon
					icon="iconamoon:arrow-left-2-bold"
					class="text-4xl {isOpen ? 'rotate-180' : ''} duration-150"
				/>
			</button>
			<div class="flex items-center justify-between">
				<span class="font-bold">{title}</span>
				<button
					type="button"
					class="grid text-light_text_black place-content-center group"
					on:click={() => {
						isOpen = false;
					}}
				>
					<iconify-icon
						icon="ic:round-close"
						class="text-3xl dark:text-dark_text_white group-hover:text-error dark:group-hover:text-dark_error"
					/>
				</button>
			</div>
			<Space gap={5} />
			<div class="relative max-h-full pr-2 overflow-y-scroll">
				<div
					class="sticky top-0 left-0 z-10 w-full h-6 pointer-events-none fading"
				/>
				<div>
					<slot />
				</div>
				<div
					class="sticky bottom-0 left-0 z-10 w-full h-6 rotate-180 pointer-events-none fading"
				/>
			</div>
		</div>
	</div>
</aside>

<style>
	.fading {
		background-color: var(--light-whiter);
		mask-image: linear-gradient(
			to bottom,
			rgb(255, 255, 255) 10%,
			rgba(255, 255, 255, 0.377),
			transparent
		);
	}
	:global(.dark) .fading {
		background-color: var(--dark-light_grey);
	}
</style>
