<script lang="ts">
	import {
		groupSubcategoryIcons,
		type GROUP_SUBCATEGORY_TYPES
	} from '~helpers/constants';
	import { onImageLoad } from '~use/onImageLoad';

	export let name: string;
	export let type: keyof typeof GROUP_SUBCATEGORY_TYPES;
	export let imageUrl: string | null;

	let isImageFallback = imageUrl === null;
</script>

<button
	type="button"
	class="relative w-full aspect-[3/2] px-4 border bg-light_grey border-light_text_black_10 rounded-md shadow-sm"
>
	<div class="absolute left-1 top-1">
		<iconify-icon
			class="grid p-2 border rounded-full bg-light_whiter place-content-center border-light_text_black_20"
			icon={groupSubcategoryIcons[type]}
		/>
	</div>
	<div
		class="relative object-cover mx-auto overflow-hidden rounded-lg w-fit aspect-square"
	>
		<div class="bg-red-500 w-[70px] h-full grid place-content-center">
			{name.split(' ').map((word) => {
				return word[0];
			})}
		</div>
		<!-- <img
			src={imageUrl}
			role="presentation"
			alt=""
			width="70"
			use:onImageLoad
			on:imageerror={(e) => {
				isImageFallback = true;
			}}
		/> -->
	</div>
	<p class="line-clamp-3 overflow-x-clip hyphens-auto">
		{name}
	</p>
</button>
