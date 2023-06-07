<script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
</script>

<div class="bg">
	<div class="px-6 py-3 bg-white w-[100vw] max-w-[450px] rounded-md">
		<h2 class="text-center uppercase text-h4">Login</h2>
		<Separator w={'100%'} h={'2px'} color="var(--light-text-black-20)" />
		<Space gap={10} />
		<p class="text-center text-light_text_black_60">
			For Effio we use login via providers like Google and GitHub
		</p>
		<Space gap={10} />
		<div class="flex items-center justify-center gap-2">
			<button
				class="flex items-center gap-3 px-6 py-2 text-orange-400 border-2 border-orange-400 border-solid rounded-md"
				><Icon icon="devicon:google" /><span class="font-semibold">Google</span></button
			>
			<span class="text-light_text_black_40">or</span>
			<button
				class="flex items-center gap-3 px-6 py-2 text-black border-2 border-black border-solid rounded-md"
				><Icon icon="mdi:github" /><span class="font-semibold">GitHub</span></button
			>
		</div>
	</div>
</div>

<style>
	.bg {
		height: clamp(100vh, 100vh, 100vh);
		width: clamp(100vw, 100vw, 100vw);
		background-image: linear-gradient(256.86deg, #c2a5ff 12.78%, #6c63ff 90.64%);
		display: grid;
		place-content: center;
	}
</style>
