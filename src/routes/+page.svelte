<script lang="ts">
	import Space from '../lib/components/separators/Space.svelte';
	import GridLayout from '../lib/components/layouts/GridLayout.svelte';
	import CallToAction from '../lib/components/buttons/CallToAction.svelte';
	import Footer from '../lib/components/page-parts/Footer.svelte';
	import LineConnectorWithTitle from '../lib/components/layouts/LineConnectorsWithTitle.svelte';
	import { draw } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { intersect } from '~use/intersectionObserver';
	import Counter from '~components/informatic/Counter.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Navbar from '~components/page-parts/Navbar.svelte';
	import ScrollToTop from '~components/buttons/ScrollToTop.svelte';
	import gsap from 'gsap/dist/gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { onMount } from 'svelte';

	export let data;

	let displayUnderline = false;

	function animateBar(
		triggerElement: string,
		onEnterWidth: string,
		onLeaveBackWidth: string,
		onEnterOther: { [key: string]: any } = {},
		onLeaveOther: { [key: string]: any } = {}
	) {
		gsap.to('.bar', {
			scrollTrigger: {
				trigger: triggerElement,
				start: 'top center',
				end: 'bottom bottom',
				scrub: true,
				onEnter: () => {
					gsap.to('.bar', {
						width: onEnterWidth,
						duration: 0.2,
						ease: 'none',
						...onEnterOther
					});
				},
				onLeaveBack: () => {
					gsap.to('.bar', {
						width: onLeaveBackWidth,
						duration: 0.2,
						ease: 'none',
						...onLeaveOther
					});
				}
			}
		});
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		animateBar('#section1', '400px', '0px');
		animateBar(
			'#section2',
			'400px',
			'400px',
			{ right: 'calc(100vw - 400px)' },
			{ right: 0 }
		);
	});
</script>

<!-- <Toaster /> -->
<ScrollToTop />

<div class="absolute top-0 right-0 w-0 h-full bg-black bar" />

<header class="z-[100] relative bg-light_white dark:bg-dark_black">
	<section
		class="container relative px-2 mx-auto xl:h-screen xl:max-h-screen xl:grid md:px-6 landing-section grid__container"
	>
		<!-- <div class="w-full h-[var(--nav-height)] bg-light_quaternary rounded-4xl" /> -->
		<Navbar includeSeparator={false} user={data.session} />
		<div
			class="relative grid-cols-12 grid-rows-6 xl:grid gap-x-8 gap-y-4 xl:max-h-[800px]"
		>
			<div class="col-span-5 row-span-2 gradient-bg rounded-2xl">
				<img
					src="/imgs/effio/effio-white-cropped.png"
					role="presentation"
					alt=""
					class="object-contain w-full h-full max-w-[500px]"
				/>
			</div>
			<div
				class="col-span-5 row-span-1 row-start-3 mx-auto w-fit"
				use:intersect
				on:intersect={() => {
					displayUnderline = true;
				}}
				on:unintersect={() => {
					displayUnderline = false;
				}}
			>
				<h1 class="font-semibold text-center text-h4 sm:text-h2 2xl:text-h1">
					Online test creation tool
				</h1>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="681"
					height="24"
					viewBox="0 0 681 24"
					fill="none"
					class="w-full px-2"
				>
					{#if displayUnderline}
						<path
							transition:draw={{ duration: 1000, easing: cubicIn }}
							d="M0 12C4.96629 12 218.23 5.33333 324.242 2H680L144.213 22H465.112"
							stroke="#6433F0"
							stroke-width="3"
						/>
					{/if}
				</svg>
			</div>
			<div class="col-span-5 row-span-1 row-start-4">
				<p class="font-medium text-h6 sm:text-h5 2xl:text-h4">
					Create a test, share it, try to take tests of others and learn new
					stuff in process and all of it in user friendly environment
				</p>
			</div>
			<div
				class="flex flex-col justify-end col-span-5 row-span-2 row-start-5 gap-1 p-2 pb-8"
			>
				<p>All you need is a Google or Github account</p>
				<div class="relative grid gap-4 sm:grid-cols-2">
					<a
						href={data.session?.user ? '/dashboard' : '/login'}
						class="py-4 font-bold text-center normal-case rounded-lg text-body1 2xl:text-h6 bg-light_primary text-light_white hover:bg-light_primary hover:brightness-125"
					>
						{data.session?.user ? 'Go to Dashboard' : 'Start now'}
					</a>
					<a
						href={data.session?.user ? '/dashboard' : '/login'}
						class="py-4 font-normal text-center normal-case rounded-lg text-body1 2xl:text-h6 bg-light_terciary text-light_white hover:bg-light_secondary hover:brightness-125"
					>
						Learn More
					</a>
				</div>
			</div>
			<div
				class="relative grid w-full h-full col-span-7 row-span-6 place-items-center"
			>
				<img
					src="/imgs/svgs/homepage/mobile.png"
					role="presentation"
					alt=""
					class="absolute w-3/5 max-h-[115%] top-[5%] sm:top-auto sm:-bottom-[10%] z-[2] object-contain"
				/>
				<img
					src="/imgs/svgs/rounded-container.png"
					role="presentation"
					alt=""
					class="w-full h-full max-h-[800px]"
				/>
				<div
					class="sm:absolute overflow-hidden bottom-0 p-2 sm:p-6 grid w-full sm:grid-cols-2 gap-6 z-[3]"
				>
					<div
						class="p-2 2xl:p-4 aspect-video rounded-xl animate-fly_x"
						style="background-color: #6433f050; backdrop-filter: blur(14px);"
					>
						<div class="flex flex-col gap-1">
							<div class="flex items-center justify-center gap-1">
								<span class="text-light_whiter text-body2 2xl:text-body1"
									>Types of inputs available:</span
								>
								<Counter
									count={6}
									class="bg-transparent shadow-none"
									numberClasses="text-h1"
									color="white"
								/>
							</div>
							<Separator
								color="var(--dark-text-white-40)"
								w={'80%'}
								h={'2px'}
							/>
							<div class="flex justify-center text-white w-fit">
								<p class="w-fit">
									Available features: <b>Test Creator</b>,
									<b>Marking</b> <b>Groups</b>,
									<b>Community place</b>, <b>Test History</b>,
									<b>Test Editing</b>
									and more
								</p>
							</div>
						</div>
					</div>
					<div
						class="w-full h-full p-2 2xl:p-4 aspect-video rounded-xl animate-fly_x_reversed"
						style="background-color: #6433f050; backdrop-filter: blur(14px);"
					>
						<div class="flex flex-col justify-between h-full gap-1">
							<div>
								<h5 class="font-semibold text-white text-body1">
									Explore what the communnity has created!
								</h5>
							</div>
							<!-- <Separator
								color="var(--dark-text-white-40)"
								w={'80%'}
								h={'2px'}
							/> -->
							<a
								href={'/community'}
								class="py-4 font-normal text-center normal-case rounded-lg text-body1 2xl:text-h6 bg-light_primary text-light_white dark:text-dark_text_white hover:bg-light_primary hover:brightness-125"
							>
								Visit community place
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</header>

<main class="bg-light_quaternary dark:bg-dark_quaternary">
	<div class="container mx-auto md:px-0 lg:px-0 xl:px-20" id="content">
		<!-- About us section -->
		<section class="grid-layout__about-us">
			<div class="p-4 image">
				<img
					src="/imgs/svgs/homepage/monitor.png"
					alt=""
					class="object-contain h-full mx-auto md:mr-auto"
				/>
			</div>
			<div class="background rounded-4xl" />
			<div class="flex flex-col justify-center gap-4 p-2 md:p-4 content">
				<div class="mx-auto w-fit md:mr-auto">
					<h1
						class="text-white w-fit text-body1 lg:text-h4 xl:text-h3 2xl:text-h2"
					>
						Want to know more about Effio?
					</h1>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="40"
						height="24"
						viewBox="0 0 681 24"
						fill="none"
						class="w-full px-2"
					>
						<path
							d="M0 12C4.96629 12 218.23 5.33333 324.242 2H680L144.213 22H465.112"
							stroke="#343540"
							stroke-width="3"
						/>
					</svg>
				</div>
				<div class="flex flex-col items-center gap-2">
					<p class="text-dark_text_white text-body2 md:text-body1 xl:text-h6">
						Section about motivation, technologies, making Effio and more...
					</p>
					<a
						href={'/about'}
						class="px-8 py-2 rounded-lg h-fit whitespace-nowrap text-body1 2xl:text-h6 bg-light_primary text-light_white dark:text-dark_text_white hover:bg-light_primary hover:brightness-125"
					>
						About us
					</a>
				</div>
			</div>
		</section>
		<section id="section1">
			<LineConnectorWithTitle title="Community place">
				<h2
					class="font-bold text-h5 xs:text-h4 sm:text-h3 md:text-h2 lg:text-h1 text-light_primary dark:text-dark_primary"
				>
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
					class="text-body2 md:text-body1 text-light_text_black dark:text-dark_text_white"
				>
					Browse and share your own created tests for all other users here
				</p>
			</LineConnectorWithTitle>
			<GridLayout>
				<slot slot="a">
					<div class="flex flex-col justify-between h-full">
						<h3 class="mb-auto font-light text-h6 md:text-h4 text-light_white">
							Explore what have community created!
						</h3>
						<div>
							<img
								src="/imgs/community_place.svg"
								alt="Community place"
								class="max-w-[300px] mx-auto w-full xs:w-auto"
							/>
							<Space gap={36} />
							<CallToAction text={'Visit'} center="right">
								<iconify-icon icon="material-symbols:arrow-right-alt-rounded" />
							</CallToAction>
						</div>
					</div>
				</slot>
				<slot slot="b">
					<h3
						class="max-w-full md:max-w-[50%] text-light_white text-body1 md:text-h5"
					>
						Read more about the community place and all its features.
					</h3>
				</slot>
				<slot slot="c">
					<div class="flex flex-col justify-between h-full">
						<h3 class="text-light_white text-body1 md:text-h5">
							Want to create tests of you own?<br />All you need is to Log In
							using one of these providers: GitHub, Google
						</h3>
						<div class="max-h-full mt-auto ml-auto w-fit">
							<button
								on:click={() => {}}
								class="btn bg-light_primary dark:bg-dark_primary text-light_white hover:bg-light_primary_dark dark:hover:bg-dark_primary_light"
								type="button">Log In</button
							>
						</div>
					</div>
				</slot>
			</GridLayout>
		</section>
		<section id="section2">
			<LineConnectorWithTitle title="Test creator" lineColor={'var(--success)'}>
				<h2
					class="font-bold text-h5 xs:text-h4 sm:text-h3 md:text-h2 lg:text-h1 text-success"
				>
					<span
						class="font-normal text-light_text_black dark:text-dark_text_white text-body1"
						>The</span
					>
					Ultimate Generator
				</h2>
				<p
					class="text-body2 md:text-body1 text-light_text_black dark:text-dark_text_white"
				>
					Create tests using simple and user friendly enviroment with plenty of
					options
				</p>
			</LineConnectorWithTitle>
			<GridLayout>
				<slot slot="a">
					<div class="flex flex-col justify-between h-full">
						<h3 class="mb-auto font-light text-h6 md:text-h4 text-light_white">
							Create your own tests using simple enviroment!
						</h3>
						<Space gap={10} />
						<div>
							<img
								src="/imgs/online_test.svg"
								alt="Community place"
								class="max-w-[300px] mx-auto w-full xs:w-auto"
							/>
							<Space gap={36} />
							<CallToAction text={'Visit'} center="right">
								<iconify-icon icon="material-symbols:arrow-right-alt-rounded" />
							</CallToAction>
						</div>
					</div>
				</slot>
				<slot slot="b">
					<h3
						class="max-w-full md:max-w-[50%] text-light_white text-body1 md:text-h5"
					>
						Import and export in GIFT format compatible with other popular
						platforms like Moodle.
					</h3>
				</slot>
				<slot slot="c">
					<div class="flex flex-col justify-between h-full">
						<h3 class="text-light_white text-body1 md:text-h5">
							Want to create tests of you own?<br />All you need is to Log In
							using one of these providers: GitHub, Google
						</h3>
						<div class="max-h-full mt-auto ml-auto w-fit">
							<button
								on:click={() => {}}
								class="btn bg-light_primary dark:bg-dark_primary text-light_white hover:bg-light_primary_dark dark:hover:bg-dark_primary_light"
								type="button">Log In</button
							>
						</div>
					</div>
				</slot>
			</GridLayout>
		</section>
	</div>
	<Space gap={50} />
	<Footer />
</main>

<style>
	.landing-section {
		--gap: 1rem;
		--y-padding: 4rem;
		--nav-height: 70px;
		padding-block: var(--y-padding);
	}

	.gradient-bg {
		background-image: url('/imgs/gradient-bg.png');
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}

	.grid__container {
		gap: var(--gap);
		grid-template-rows: auto calc(
				100vh - var(--y-padding) * 2 - var(--nav-height) - var(--gap)
			);
	}

	.hero__section {
		background: linear-gradient(
			103.97deg,
			#9ba3eb 0.9%,
			#c2a5ff 52.16%,
			#dbdffd 100%
		);
	}

	.hero__section_dark {
		background: linear-gradient(180deg, #1c065c 0%, #0092ca 100%);
	}

	/* About us section */
	.grid-layout__about-us {
		display: grid;
		max-height: 300px;
		isolation: isolate;
		grid-template-columns: [image-start background-start] 2fr [image-end content-start] 3fr [content-end background-start background-end];
		grid-template-rows: [image-start] 3rem [content-start background-start] auto [content-end image-end background-end];
	}

	@media (max-width: 768px) {
		.grid-layout__about-us {
			max-height: 800px;
			grid-template-columns: [image-start background-start content-end background-end] 1fr [content-end background-start background-end image-end];
			grid-template-rows: [image-start] 3rem [background-start] auto [image-end content-start] auto [content-end background-end];
		}
	}

	.grid-layout__about-us > .background {
		grid-area: background;
		z-index: -1;
		background-image: url('/imgs/svgs/homepage/about_bg.svg');
		background-repeat: no-repeat;
		background-size: cover;
	}
	.grid-layout__about-us > .image {
		grid-area: image;
		max-height: 300px;
	}
	.grid-layout__about-us > .content {
		grid-area: content;
	}
</style>
