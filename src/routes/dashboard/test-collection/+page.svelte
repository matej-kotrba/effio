<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
</script>

<h2 class="text-h3 font-extralight text-light_text_black">Test Collection</h2>
<p class="text-body1 text-light_text_black_40">
	Here you can see all your tests which you have created
</p>
<Space />
<h3 class="text-h4">Recent activity</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="flex gap-4">
	<div class="w-full max-w-xs p-5 rounded-md shadow-lg aspect-square bg-light_white">asd</div>
	<div
		class="w-full max-w-xs p-5 bg-white rounded-lg shadow-lg shadow-light_text_black_40 aspect-square card_bg"
	>
		<img
			class="rounded-lg w-[100%] aspect-[3/2] object-cover"
			src="/imgs/content_imgs/liska.avif"
			alt="Liška"
		/>
		<p>Do you know the nature ?</p>
	</div>
</div>

<style>
	.card_bg {
		background-image: url('/imgs/svgs/card_bg.svg');
	}
</style>
