<script lang="ts">
	import LogInButton from '../lib/components/LogInButton.svelte';
</script>

<main>
	<div class="py-20 hero__section">
		<div class="container flex w-full py-10 mx-auto h-fit">
			<div class="rounded-3xl bg-light_transparent_blue w-[60%] container mx-auto p-12">
				<h1 class="font-bold text-h1 text-light_white">Effio</h1>
				<p class="text-light_white w-[80%] text-h6">
					Boost yout productivity, create tests for yourself and others and learn all in a modern
					user friendly enviroment. Introducing <b>Effio</b> - online test creation tool which will help
					you achieve all of that.
				</p>
				<p />
				<LogInButton />
			</div>
			<div class="translate-x-[-13%] translate-y-[15%] relative">
				<img src="/imgs/test.svg" alt="Test" class="relative z-10 w-[1000px]" />
				<div
					class="absolute p-8 bg-light_text_black_20 text-h5 text-light_white bottom-[100%] right-0 rounded-4xl pb-40 translate-y-[60%]"
				>
					<p>Learn everything at one place</p>
				</div>
				<div
					class="absolute p-8 bg-light_text_black_20 text-h5 text-light_white bottom-0 right-0 rounded-4xl pt-20 pr-40 translate-y-[-110%] translate-x-[-20%]"
				>
					<p>Create, share, explore</p>
				</div>
			</div>
		</div>
	</div>
	<div class="container" />
</main>

<style lang="postcss">
	.hero__section {
		background: linear-gradient(103.97deg, #9ba3eb 0.9%, #c2a5ff 52.16%, #dbdffd 100%);
	}
</style>
