<script script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '~components/buttons/BasicButton.svelte';
	import Space from '../lib/components/separators/Space.svelte';
	import GridLayout from '../lib/components/layouts/GridLayout.svelte';
	import CallToAction from '../lib/components/buttons/CallToAction.svelte';
	import Footer from '../lib/components/page-parts/Footer.svelte';
	import LineConnectorWithTitle from '../lib/components/layouts/LineConnectorsWithTitle.svelte';
	import toast, { Toaster } from 'svelte-french-toast';
	import { applicationStates } from '~stores/applicationStates';

	export let data;

	$: if (data.hasLoggedOut) {
		toast.success('You were successfully logged out!');
	}
</script>

<Toaster />
<header>
	<section
		class={`px-2 py-20 xl:px-8 ${
			$applicationStates.isDarkMode ? 'hero__section_dark' : 'hero__section'
		}`}
	>
		<div class="container flex w-full py-10 mx-auto h-fit">
			<div
				class="rounded-3xl bg-light_transparent_blue w-[60%] container mx-auto p-8"
			>
				<h1 class="font-bold text-h3 md:text-h2 xl:text-h1 text-light_white">
					Effio
				</h1>
				<p class="text-light_white w-[80%] text-body2 md:text-body1 xl:text-h6">
					Boost yout productivity, create tests for yourself and others and
					learn all in a modern user friendly enviroment. Introducing <b
						>Effio</b
					> - online test creation tool which will help you achieve all of that.
				</p>
				<Space gap={80} />
				<p class="text-light_white text-body1">
					All you need is Github or Google account!
				</p>
				<Space gap={10} />
				<div class="flex items-center gap-4">
					<a
						href={data.session?.user ? '/dashboard' : '/login'}
						class="btn bg-light_primary dark:bg-light_primary_dark text-light_white dark:text-dark_text_white hover:bg-light_primary hover:brightness-125"
					>
						{data.session?.user ? 'Go to Dashboard' : 'Log In'}
					</a>
					<button
						on:click={() => {}}
						class="btn bg-light_white text-light_primary hover:bg-light_white hover:brightness-125"
						type="button">Read More</button
					>
				</div>
			</div>
			<div class="translate-x-[-13%] translate-y-[15%] relative">
				<img src="/imgs/test.svg" alt="Test" class="relative z-10 w-[1000px]" />
				<div
					class="absolute p-8 bg-light_transparent_blue text-body1 md:text-h6 xl:text-h5 text-light_white bottom-[100%] right-0 rounded-4xl pb-40 translate-y-[60%]"
				>
					<p>Learn everything at one place</p>
				</div>
				<div
					class="absolute p-8 bg-light_transparent_blue text-body1 md:text-h6 xl:text-h5 text-light_white
				bottom-[100%] right-0 rounded-4xl pt-20 pr-40 lg:translate-y-[220%] xl:translate-y-[240%] xl:translate-x-[-10%] 2xl:translate-y-[260%] 2xl:translate-x-[-20%]"
				>
					<p>Create, share, explore</p>
				</div>
			</div>
		</div>
	</section>
</header>
<main class="bg-light_quaternary dark:bg-dark_quaternary">
	<img
		src={$applicationStates.isDarkMode
			? '/imgs/layer_dark.svg'
			: '/imgs/layer2.svg'}
		alt="Layer"
		class="w-full"
	/>
	<div class="container mx-auto md:px-0 lg:px-0 xl:px-20" id="content">
		<LineConnectorWithTitle title="Community place">
			<h2 class="font-bold text-h1 text-light_primary">
				CREATE<span class="text-light_text_black dark:text-dark_text_white"
					>,</span
				>
				SHARE
				<span
					class="text-sm font-normal text-light_text_black dark:text-dark_text_white"
					>and</span
				> EXPLORE
			</h2>
			<p
				class="pl-4 text-body1 text-light_text_black dark:text-dark_text_white"
			>
				Browse and share your own created tests for all other users here
			</p>
		</LineConnectorWithTitle>
		<GridLayout>
			<slot slot="a">
				<div class="flex flex-col justify-between h-full">
					<h3 class="mb-auto font-light text-h4 text-light_white">
						Explore what have community created!
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
						Want to create tests of you own?<br />All you need is to Log In
						using one of these providers: GitHub, Google
					</h3>
					<div class="max-h-full mt-auto ml-auto w-fit">
						<button
							on:click={() => {}}
							class="btn bg-light_primary text-light_white hover:bg-light_primary"
							type="button">Log In</button
						>
					</div>
				</div>
			</slot>
		</GridLayout>
		<LineConnectorWithTitle title="Test creator" lineColor={'var(--success)'}>
			<h2 class="font-bold text-h1 text-success">
				<span
					class="font-normal text-light_text_black dark:text-dark_text_white text-body1"
					>The</span
				>
				Ultimate Generator
			</h2>
			<p
				class="pl-4 text-body1 text-light_text_black dark:text-dark_text_white"
			>
				Create tests using simple and user friendly enviroment with plenty of
				options
			</p>
		</LineConnectorWithTitle>
		<GridLayout>
			<slot slot="a">
				<div class="flex flex-col justify-between h-full">
					<h3 class="mb-auto font-light text-h4 text-light_white">
						Create your own tests using simple enviroment!
					</h3>
					<Space gap={10} />
					<div>
						<img src="/imgs/online_test.svg" alt="Community place" />
						<Space gap={36} />
						<CallToAction text={'Visit'} center="right">
							<Icon icon="material-symbols:arrow-right-alt-rounded" />
						</CallToAction>
					</div>
				</div>
			</slot>
			<slot slot="b">
				<h3 class="max-w-[50%] text-light_white text-h5">
					Import and export in GIFT format compatible with other popular
					platforms like Moodle.
				</h3>
			</slot>
			<slot slot="c">
				<div class="flex flex-col justify-between h-full">
					<h3 class="text-light_white text-h5">
						Want to create tests of you own?<br />All you need is to Log In
						using one of these providers: GitHub, Google
					</h3>
					<div class="max-h-full mt-auto ml-auto w-fit">
						<button
							on:click={() => {}}
							class="btn bg-light_primary text-light_white hover:bg-light_primary"
							type="button">Log In</button
						>
					</div>
				</div>
			</slot>
		</GridLayout>
	</div>
	<Space gap={500} />
	<Footer />
</main>

<style>
	.hero__section {
		background: linear-gradient(
			103.97deg,
			#9ba3eb 0.9%,
			#c2a5ff 52.16%,
			#dbdffd 100%
		);
	}

	.hero__section_dark {
		background: linear-gradient(
			134deg,
			#6b37ff 0%,
			#1a0e35 51.56%,
			#8044ff 100%
		);
	}
</style>
