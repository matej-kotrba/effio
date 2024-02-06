<script lang="ts" context="module">
	import toast from 'svelte-french-toast';
	import { ALLOWED_IMAGE_TYPES } from '~helpers/constants';

	export function setImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		allowedTypes: string[],
		maxImageSizeInMB: number,
		onFileLoad: (file: File, resultUrl: string) => void
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
			onFileLoad(file, reader.result as string);
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
</script>

<div
	class="relative grid w-full border-2 border-black border-dashed aspect-video place-content-center"
>
	<input
		type="file"
		name="image-upload-{inputId}"
		id="image-upload-{inputId}"
		accept={allowedImageTypes.map((name) => `image/${name}`).join(', ')}
		class="absolute w-full h-full opacity-0 cursor-pointer"
		on:change={onImageUpload}
	/>
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
