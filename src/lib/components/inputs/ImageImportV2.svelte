<script lang="ts" context="module">
	import toast from 'svelte-french-toast';
	import { ALLOWED_IMAGE_TYPES } from '~helpers/constants';

	export function setImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		allowedTypes: string[],
		maxImageSizeInMB: number,
		onFileLoad?: (file: File, resultUrl: string) => void
	) {
		if (!e.currentTarget.files) return;
		const file = e.currentTarget.files[0];

		if (file.type.split('/')[0] !== 'image') {
			toast.error('File is not an image!');
			e.currentTarget.value = '';

			return;
		}

		if (allowedTypes.includes(file.type.split('/')[1]) === false) {
			toast.error(
				`File type is not supported!\nUse ${allowedTypes.join(', ')} instead`
			);
			e.currentTarget.value = '';

			return;
		}

		if (!file) return;

		if (file.size > maxImageSizeInMB * 1024 * 1024) {
			toast.error(`Image is too big! Max size is ${maxImageSizeInMB}MB`);
			e.currentTarget.value = '';

			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = () => {
			if (onFileLoad) onFileLoad(file, reader.result as string);
		};
	}
</script>

<script lang="ts">
	export let allowedImageTypes: string[] = ALLOWED_IMAGE_TYPES;
	export let uploadedImageUrl: string | undefined | null;
	export let onImageUpload: (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => void;
	export let inputId: number | string;
	export let fileInput: HTMLInputElement | null = null;
	export let onReset: (() => void) | undefined = undefined;

	function onResetButtonClick() {
		if (fileInput) {
			fileInput.value = '';
		}
		if (onReset) onReset();
	}
</script>

<div
	class="relative grid w-full border-2 border-dashed border-light_text_black dark:border-dark_text_white aspect-video place-content-center"
>
	<input
		bind:this={fileInput}
		type="file"
		name="image-upload-{inputId}"
		id="image-upload-{inputId}"
		accept={allowedImageTypes.map((name) => `image/${name}`).join(', ')}
		class="absolute w-full h-full opacity-0 cursor-pointer"
		on:change={onImageUpload}
	/>
	{#if onReset}
		<button
			type="button"
			class="absolute z-10 grid text-2xl text-white duration-100 right-1 top-1 drop-shadow-sm hover:text-light_grey_dark hover:rotate-180 place-content-center"
			on:click={onResetButtonClick}
		>
			<iconify-icon icon="fluent:arrow-sync-16-regular" />
		</button>
	{/if}
	<div
		class="absolute w-full h-full overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-md pointer-events-none left-1/2 top-1/2"
	>
		<img
			src={uploadedImageUrl}
			alt="Group icon"
			class="object-cover w-full h-full text-transparent"
		/>
	</div>
	<iconify-icon icon="ph:image-light" class="mx-auto text-4xl" />
	<span>Upload image</span>
</div>
