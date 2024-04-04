<script lang="ts">
	import { onImageLoad } from '~use/onImageLoad';

	export let imageUrl: string;

	let isFallback = false;
</script>

{#if isFallback === true}
	<div class="w-12 aspect-square">
		<img
			src={imageUrl}
			alt="User"
			class="object-cover w-full h-full rounded-full"
			use:onImageLoad
			on:imageerror={(e) => {
				isFallback = true;
			}}
		/>
	</div>
{:else}
	<div class="grid place-content-center">
		<iconify-icon icon="fa:user-circle" class="text-4xl" />
	</div>
{/if}
