<script lang="ts">
	import toast from 'svelte-french-toast';
	import { twMerge } from 'tailwind-merge';
	import { IMAGE_IMPORT_SIZE_IN_MB } from '~helpers/constants';

	export let title: string;
	export let maxImageSizeInMB = IMAGE_IMPORT_SIZE_IN_MB;

	let classes = '';
	export { classes as class };

	let imageRef: HTMLImageElement | null = null;

	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (imageRef === null || !e.currentTarget.files) return;
		const file = e.currentTarget.files[0];
		if (!file) return;

		if (file.size > maxImageSizeInMB * 1024 * 1024) {
			toast.error(`Image is too big! Max size is ${maxImageSizeInMB}MB`);
			e.currentTarget.value = '';
			imageRef.src = '';

			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = () => {
			imageRef!.src = reader.result as string;
		};
	}
</script>

<div class="flex flex-col">
	<span class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
		>{title}</span
	>
	<div
		class={twMerge(
			'relative grid duration-100 border-2 border-dashed rounded-md group w-28 border-light_text_black_80 dark:border-dark_text_white_80 aspect-square place-content-center hover:bg-light_white dark:hover:bg-dark_quaternary',
			classes
		)}
	>
		<input
			type="file"
			name="image"
			on:change={onImageUpload}
			accept="image/jpeg, image/png, image/jpg, image/webp, image/avif"
			class="absolute w-full h-full opacity-0 cursor-pointer"
		/>
		<div
			class="absolute w-full overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-md pointer-events-none aspect-square left-1/2 top-1/2"
		>
			<img
				bind:this={imageRef}
				src=""
				alt="Group icon"
				class="object-cover w-full h-full text-transparent"
			/>
		</div>
		<iconify-icon
			icon="uil:plus"
			class="text-5xl pointer-events-none group-hover:z-10 drop-shadow-md"
		/>
	</div>
</div>
