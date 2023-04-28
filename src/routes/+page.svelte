<script script lang="ts">
	import Icon from '@iconify/svelte';
	import LogInButton from '../lib/components/buttons/LogInButton.svelte';
	import Space from '../lib/components/Space.svelte';
	import GridLayout from '../lib/components/GridLayout.svelte';
	import CallToAction from '../lib/components/buttons/CallToAction.svelte';
</script>

<main class="bg-light_quaternary">
	<div class="px-8 py-20 hero__section">
		<div class="container flex w-full py-10 mx-auto h-fit">
			<div class="rounded-3xl bg-light_transparent_blue w-[60%] container mx-auto p-8">
				<h1 class="font-bold text-h3 md:text-h2 xl:text-h1 text-light_white">Effio</h1>
				<p class="text-light_white w-[80%] text-body2 md:text-body1 xl:text-h6">
					Boost yout productivity, create tests for yourself and others and learn all in a modern
					user friendly enviroment. Introducing <b>Effio</b> - online test creation tool which will help
					you achieve all of that.
				</p>
				<Space gap={80} />
				<p class="text-light_white text-body1">All you need is Github or Google account!</p>
				<Space gap={10} />
				<LogInButton />
			</div>
			<div class="translate-x-[-13%] translate-y-[15%] relative">
				<img src="/imgs/test.svg" alt="Test" class="relative z-10 w-[1000px]" />
				<div
					class="absolute p-8 bg-light_text_black_20 text-body1 md:text-h6 xl:text-h5 text-light_white bottom-[100%] right-0 rounded-4xl pb-40 translate-y-[60%]"
				>
					<p>Learn everything at one place</p>
				</div>
				<div
					class="absolute p-8 bg-light_text_black_20 text-body1 md:text-h6 xl:text-h5 text-light_white
					 bottom-[100%] right-0 rounded-4xl pt-20 pr-40 lg:translate-y-[220%] xl:translate-y-[240%] xl:translate-x-[-10%] 2xl:translate-y-[260%] 2xl:translate-x-[-20%]"
				>
					<p>Create, share, explore</p>
				</div>
			</div>
		</div>
	</div>
	<img src="/imgs/layer2.svg" alt="Layer" class="w-full" />
	<div class="container px-20 mx-auto">
		<GridLayout>
			<slot slot="a">
				<div class="flex flex-col justify-between h-full">
					<h3 class="mb-auto font-light text-h4 text-light_white">
						Explore what community created!
					</h3>
					<div>
						<img src="/imgs/community_place.svg" alt="Community place" />
						<Space gap={36} />
						<CallToAction text={'Visit'} center="right">
							<Icon icon="material-symbols:arrow-right-alt-rounded" />
						</CallToAction>
					</div>
				</div>
			</slot>
			<slot slot="b">
				<h3 class="max-w-[50%] text-light_white text-h5">
					Read more about the community place and all its features.
				</h3>
			</slot>
			<slot slot="c">
				<div class="flex flex-col justify-between h-full">
					<h3 class="text-light_white text-h5">
						Want to create tests of you own?<br />All you need is to Log In using one of these
						providers: GitHub, Google
					</h3>
					<div class="max-h-full mt-auto ml-auto w-fit">
						<LogInButton />
					</div>
				</div>
			</slot>
		</GridLayout>
	</div>
	<Space gap={500} />
</main>

<style lang="postcss">
	.hero__section {
		background: linear-gradient(103.97deg, #9ba3eb 0.9%, #c2a5ff 52.16%, #dbdffd 100%);
	}
</style>
