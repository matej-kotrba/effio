<script lang="ts" context="module">
	import toast from 'svelte-french-toast';

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
	export let imageUrl: string;
</script>
