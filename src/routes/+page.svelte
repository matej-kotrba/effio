<script lang="ts">
	import Space from '../lib/components/separators/Space.svelte';
	import GridLayout from '../lib/components/layouts/GridLayout.svelte';
	import CallToAction from '../lib/components/buttons/CallToAction.svelte';
	import Footer from '../lib/components/page-parts/Footer.svelte';
	import LineConnectorWithTitle from '../lib/components/layouts/LineConnectorsWithTitle.svelte';
	import { draw, fade, fly } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { intersect } from '~use/intersectionObserver';
	import Counter from '~components/informatic/Counter.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Navbar from '~components/page-parts/Navbar.svelte';
	import ScrollToTop from '~components/buttons/ScrollToTop.svelte';
	import gsap from 'gsap/dist/gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { onMount } from 'svelte';
	import { handwrite } from '~use/handwrite';

	export let data;

	let displayUnderline = false;
	let displayMore = false;

	const codeLines = [
		['Create your own programming assignments,', false],
		['test cases and add hints the participants!', false],
		['', false],
		['Try out others tasks in VS Code integrated editor.', false]
	];

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.to('#section1_mobile', {
			scrollTrigger: {
				trigger: '#section1_grid',
				start: 'top center',
				end: 'bottom center',
				scrub: 1
			},
			y: 200
		});

		gsap.to('#programming__mockup', {
			scrollTrigger: {
				trigger: '#section3',
				start: 'top center',
				end: 'bottom center',
				scrub: 1
			},
			y: 0
		});
	});

	// const BAR_SECTIONS = {
	// 	SECTION0: '0px',
	// 	SECTION1: '400px',
	// 	SECTION2: '400px'
	// };

	// const SECTION1_Y_TRANSLATE = '20%';

	// const MOBILE_SECTIONS_WIDTH = {
	// 	SECTION0: '300px',
	// 	SECTION1: '300px',
	// 	SECTION2: '400px'
	// };

	// const MOBILE_SECTIONS_LEFT = {
	// 	SECTION0: '100vw',
	// 	SECTION1: `calc(100vw - ${MOBILE_SECTIONS_WIDTH['SECTION1']} - ((${BAR_SECTIONS['SECTION1']} - ${MOBILE_SECTIONS_WIDTH['SECTION1']}) / 2))`,
	// 	SECTION2: '0%'
	// };

	// const STARTING_TRANSLATE_X = 2;
	// let mobileCanvasContainer: HTMLDivElement;
	// let mobile3DRef: HTMLCanvasElement;

	// onMount(async () => {
	// 	const spline = await import('@splinetool/runtime');
	// 	gsap.registerPlugin(ScrollTrigger);
	// 	const app = new spline.Application(mobile3DRef);
	// 	app
	// 		.load('https://prod.spline.design/h81QulQb8GQq0-Oa/scene.splinecode')
	// 		.then(() => {
	// 			const mobile = app.findObjectByName('mobile');
	// 			const screen = app.findObjectByName('Screen');
	// 			const screen2 = app.findObjectByName('toggle');
	// 			if (!mobile || !screen || !screen2) return;
	// 			gsap.set(mobile.scale, { x: 1, y: 1, z: 1 });
	// 			gsap.set(mobile.position, { x: STARTING_TRANSLATE_X, y: 0 });
	// 			gsap.set(mobile.rotation, { y: -1 / 5, x: -1 / 6 });
	// 			let rotateMobile = gsap.to(mobile.rotation, {
	// 				x: mobile.rotation.y,
	// 				y: (Math.PI / 180) * 20,
	// 				z: mobile.rotation.z,
	// 				yoyoEase: true,
	// 				duration: 5,
	// 				repeat: -1,
	// 				ease: 'Power1.easeInOut'
	// 			});
	// 			const tl = gsap
	// 				.timeline({
	// 					scrollTrigger: {
	// 						scrub: true
	// 					}
	// 				})
	// 				.to(mobileCanvasContainer, {
	// 					y: SECTION1_Y_TRANSLATE,
	// 					scrollTrigger: {
	// 						trigger: '#section1',
	// 						start: 'top center',
	// 						end: 'bottom center',
	// 						scrub: true
	// 					}
	// 				})
	// 				.to(mobileCanvasContainer, {
	// 					scrollTrigger: {
	// 						trigger: '#section2',
	// 						start: 'top center',
	// 						end: 'bottom center',
	// 						scrub: true,
	// 						// onLeaveBack: () => {
	// 						// 	gsap.to(mobileCanvasContainer, {
	// 						// 		y: '20%',
	// 						// 		duration: 0.2
	// 						// 	});
	// 						// }
	// 						onEnter: () => {
	// 							gsap.to('#mobile-canvas', {
	// 								y: '0%',
	// 								duration: 1
	// 							});
	// 						}
	// 					}
	// 				})
	// 				.to(mobileCanvasContainer, {
	// 					duration: 2,
	// 					scrollTrigger: {
	// 						trigger: '#section3',
	// 						start: 'top center',
	// 						end: '75% center',
	// 						scrub: true,
	// 						toggleClass: 'fullscreen',
	// 						onEnter: () => {
	// 							gsap.to('#blob', {
	// 								width: '100vw',
	// 								left: '50vw',
	// 								translateX: '-50%',
	// 								borderRadius: '0',
	// 								duration: 0.6
	// 							});
	// 						},
	// 						onLeave: () => {
	// 							gsap.to(mobile3DRef, {
	// 								scrollTrigger: {
	// 									trigger: '#about-button',
	// 									start: '-210px center',
	// 									end: '600px center',
	// 									scrub: 1
	// 								},
	// 								duration: 1,
	// 								translateY: '-100vh'
	// 							});
	// 						},
	// 						onLeaveBack: () => {
	// 							gsap.to('#blob', {
	// 								width: '100%',
	// 								left: 'auto',
	// 								translateX: '0%',
	// 								borderRadius: '100%',
	// 								duration: 0.4
	// 							});
	// 							gsap.to('#about-text', {
	// 								opacity: 0,
	// 								duration: 0.4
	// 							});
	// 						}
	// 					}
	// 				});
	// 			gsap.to('#about-text', {
	// 				opacity: 1,
	// 				duration: 0.4,
	// 				y: '0px',
	// 				overwrite: true,
	// 				scrollTrigger: {
	// 					trigger: '#section3',
	// 					start: 'top center',
	// 					end: 'bottom center',
	// 					scrub: true,
	// 					onEnter: () => {
	// 						gsap.set('#about-text', { opacity: 0 });
	// 					}
	// 				}
	// 			});
	// 			gsap.to(mobile3DRef, {
	// 				scrollTrigger: {
	// 					trigger: '#section3',
	// 					start: '60% center',
	// 					end: '80% center',
	// 					scrub: false,
	// 					onEnter: () => {
	// 						gsap.to(mobile.rotation, {
	// 							x: (Math.PI / 180) * 10,
	// 							y: (Math.PI / 180) * 340,
	// 							z: (Math.PI / 180) * 2,
	// 							scale: 0.8,
	// 							duration: 0.8
	// 						});
	// 						screen2.scale.x = 0;
	// 						gsap.to(mobile3DRef, {
	// 							duration: 0.4,
	// 							rotate: '80deg',
	// 							left: '50vw',
	// 							translateX: '-50%'
	// 						});
	// 					},
	// 					onLeaveBack: () => {
	// 						// gsap.set(mobile.rotation, {
	// 						// 	x: (Math.PI / 180) * 10,
	// 						// 	y: (Math.PI / 180) * -25,
	// 						// 	z: (Math.PI / 180) * 2
	// 						// });
	// 						gsap.to(mobile.rotation, {
	// 							// { y: -1 / 5, x: -1 / 6 }
	// 							// y: (Math.PI / 180) * 20,
	// 							y: (Math.PI / 180) * 380,
	// 							x: (Math.PI / 180) * -20,
	// 							z: 0,
	// 							scale: 0.8,
	// 							duration: 1
	// 						});
	// 						screen2.scale.x = screen2.scale.y;
	// 						gsap.to(mobile3DRef, {
	// 							duration: 0.2,
	// 							left: 0,
	// 							scale: 1,
	// 							rotate: '0deg',
	// 							translateX: '0px'
	// 						});
	// 					}
	// 				}
	// 			});
	// 			gsap.to('#mobile-canvas', {
	// 				scrollTrigger: {
	// 					trigger: '#section1',
	// 					start: 'top center',
	// 					end: 'bottom bottom',
	// 					scrub: true,
	// 					onEnter: () => {
	// 						gsap.to('#mobile-canvas', {
	// 							maxWidth: MOBILE_SECTIONS_WIDTH['SECTION1'],
	// 							left: MOBILE_SECTIONS_LEFT['SECTION1'],
	// 							duration: 0.2,
	// 							ease: 'none'
	// 						});
	// 					},
	// 					onLeaveBack: () => {
	// 						gsap.to('#mobile-canvas', {
	// 							maxWidth: MOBILE_SECTIONS_WIDTH['SECTION0'],
	// 							left: MOBILE_SECTIONS_LEFT['SECTION0'],
	// 							duration: 0.2,
	// 							ease: 'none'
	// 						});
	// 					}
	// 				}
	// 			});
	// 			gsap.to('#mobile-canvas', {
	// 				scrollTrigger: {
	// 					trigger: '#section2',
	// 					start: 'top center',
	// 					end: 'bottom bottom',
	// 					scrub: true,
	// 					onEnter: () => {
	// 						gsap.to('#mobile-canvas', {
	// 							maxWidth: MOBILE_SECTIONS_WIDTH['SECTION2'],
	// 							left: MOBILE_SECTIONS_LEFT['SECTION2'],
	// 							duration: 0.2,
	// 							ease: 'none'
	// 						});
	// 						rotateMobile.pause();
	// 						gsap.to(mobile.rotation, {
	// 							y: (Math.PI / 180) * 380,
	// 							x: (Math.PI / 180) * -20,
	// 							duration: 1
	// 						});
	// 						screen.scale.x = 0;
	// 					},
	// 					onLeaveBack: () => {
	// 						rotateMobile.resume();
	// 						gsap.to('#mobile-canvas', {
	// 							maxWidth: MOBILE_SECTIONS_WIDTH['SECTION1'],
	// 							left: MOBILE_SECTIONS_LEFT['SECTION1'],
	// 							duration: 0.2,
	// 							ease: 'none'
	// 						});
	// 						screen.scale.x = screen.scale.y;
	// 					}
	// 				}
	// 			});
	// 		});
	// });
</script>

<ScrollToTop />

<!-- <div
	class="hidden lg:block fixed w-screen top-0 left-0 h-[100svh] z-[20] pointer-events-none overflow-clip"
>
	<div
		class="absolute left-[100vw] px-4 -translate-y-1/2 top-1/2 max-w-[400px] aspect-[1/2] w-full isolate"
		id="mobile-canvas"
		bind:this={mobileCanvasContainer}
	>
		<div
			id="blob"
			class="absolute w-full aspect-square rounded-full top-1/2 -translate-y-1/2 bg-black z-[-100]"
		/>
		<canvas
			bind:this={mobile3DRef}
			class="absolute w-full h-full pointer-events-none"
		/>
	</div>
</div> -->

<header class="z-[100] relative bg-light_white dark:bg-dark_black">
	<section
		class="container relative px-1 mx-auto min-h-[800px] xl:h-screen xl:max-h-screen xl:grid landing-section grid__container"
	>
		<Navbar includeSeparator={false} user={data.session} />
		<div
			class="relative grid-cols-12 grid-rows-6 xl:grid gap-x-8 gap-y-4 min-h-full xl:max-h-[800px]"
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
						class={`py-4 font-bold text-center normal-case border-4 rounded-lg text-body1 2xl:text-h6 bg-light_primary text-light_white 
						border-solid border-light_primary hover:bg-light_white hover:text-light_primary duration-150`}
					>
						{data.session?.user ? 'Go to Dashboard' : 'Start now'}
					</a>
					<a
						href={data.session?.user ? '/dashboard' : '/login'}
						class={`py-4 font-normal text-center normal-case rounded-lg text-body1 2xl:text-h6 bg-light_terciary
						 text-light_white border-4 border-solid border-light_terciary hover:bg-light_white hover:text-light_terciary duration-150`}
					>
						Learn More
					</a>
				</div>
			</div>
			<div class="relative grid col-span-7 row-span-6 place-items-center">
				<img
					src="/imgs/svgs/homepage/mobile.png"
					role="presentation"
					alt=""
					class="absolute w-3/5 max-h-[115%] top-[5%] sm:top-auto sm:-bottom-[10%] z-[2] object-contain"
				/>
				<div class="overflow-hidden h-full max-h-[800px]">
					<img
						src="/imgs/svgs/rounded-container.png"
						role="presentation"
						alt=""
						class="object-contain w-full h-full"
					/>
				</div>
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
									>Available question types:</span
								>
								<Counter
									count={9}
									class="bg-transparent shadow-none dark:bg-transparent"
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
						class="flex items-end w-full h-full p-2 2xl:p-4 aspect-video rounded-xl animate-fly_x_reversed"
						style="background-color: #6433f050; backdrop-filter: blur(14px);"
					>
						<div
							class="grid w-full h-full font-extrabold tracking-widest text-center text-white place-content-center text-h4"
						>
							<span class="pros__text-appear" style="--delay: 900ms;"
								>SMART</span
							>
							<span class="pros__text-appear" style="--delay: 1350ms;"
								>FAST</span
							>
							<span class="pros__text-appear" style="--delay: 1800ms;"
								>RELIABLE</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</header>

<main class="">
	<div class="container px-1 mx-auto" id="content">
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
						class="px-8 py-2 duration-150 border-4 border-solid rounded-lg h-fit whitespace-nowrap text-body1 2xl:text-h6 bg-light_primary text-light_white dark:text-dark_text_white border-light_primary hover:bg-light_white hover:text-light_primary"
					>
						About us
					</a>
				</div>
			</div>
		</section>
		<section id="section1" class="grid">
			<!-- style={`grid-template-columns: 1fr ${BAR_SECTIONS['SECTION1']};`} -->
			<div>
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
				<GridLayout
					id="section1_grid"
					customLayout={{
						a: {
							columns: '1 / 3',
							rows: '1 / 3'
						},
						b: {
							columns: '3 / 4',
							rows: '1 / 3'
						},
						c: {
							columns: '4 / 6',
							rows: '1 / 3'
						}
					}}
					layoutOptions={{
						b: {
							withoutStyle: true,
							withoutLean: true
						}
					}}
					layoutStyles={{
						b: 'hidden lg:grid'
					}}
				>
					<slot slot="a">
						<div class="flex flex-col justify-between h-full lg:max-w-[auto]">
							<h3
								class="mb-auto font-semibold text-center text-h6 md:text-h4 text-light_text_black dark:text-dark_text_white"
							>
								Explore the community!
							</h3>
							<div>
								<div class="relative">
									<svg
										class="highlight_effect"
										viewBox="0 0 200 200"
										xmlns="http://www.w3.org/2000/svg"
										style="transition-delay: 100ms;"
										use:intersect
										on:intersect={(e) => {
											e.currentTarget.classList.add('active');
										}}
										on:unintersect={(e) => {
											e.currentTarget.classList.remove('active');
										}}
									>
										<path
											class="fill-light_primary dark:fill-dark_primary"
											d="M43.1,-49.3C57.5,-39.2,72.1,-27.3,70.5,-15.5C68.9,-3.8,51.1,7.7,41.5,23.6C31.9,39.5,30.5,59.7,19.3,72.2C8,84.6,-13.1,89.3,-28.3,81.9C-43.4,74.5,-52.7,55.1,-57.9,37.6C-63.1,20,-64.4,4.2,-62.4,-11.7C-60.4,-27.6,-55.2,-43.6,-44.3,-54.3C-33.4,-65,-16.7,-70.4,-1.2,-69C14.3,-67.5,28.6,-59.4,43.1,-49.3Z"
											transform="translate(100 90)"
										/>
									</svg>

									<img
										src="/imgs/svgs/homepage/community.svg"
										alt="Community place"
										class="max-w-[300px] mx-auto w-full xs:w-auto"
									/>
								</div>
								<Space gap={36} />
								<CallToAction text={'Visit'} center="right" link="/community">
									<iconify-icon
										icon="material-symbols:arrow-right-alt-rounded"
									/>
								</CallToAction>
							</div>
						</div>
					</slot>
					<slot slot="b">
						<div
							class="w-full h-full overflow-hidden scale-110 lg:grid place-content-center"
							style="transform: translateY(-200px);"
							id="section1_mobile"
						>
							<img src="/imgs/svgs/homepage/mobile_section1.png" alt="" />
						</div>
					</slot>
					<slot slot="c">
						<div class="flex flex-col justify-between h-full font-semibold">
							<h3
								class="text-light_text_black text-body1 md:text-h5 dark:text-dark_text_white"
							>
								Want to create tests of your own?<br />
								<span class="font-normal text-body1 dark:text-dark_text_white"
									>All you need is free account.</span
								>
							</h3>
							<div class="relative">
								<svg
									class="highlight_effect"
									viewBox="0 0 200 200"
									xmlns="http://www.w3.org/2000/svg"
									use:intersect
									on:intersect={(e) => {
										e.currentTarget.classList.add('active');
									}}
									on:unintersect={(e) => {
										e.currentTarget.classList.remove('active');
									}}
								>
									<path
										class="fill-light_secondary dark:fill-dark_secondary"
										d="M43.1,-49.3C57.5,-39.2,72.1,-27.3,70.5,-15.5C68.9,-3.8,51.1,7.7,41.5,23.6C31.9,39.5,30.5,59.7,19.3,72.2C8,84.6,-13.1,89.3,-28.3,81.9C-43.4,74.5,-52.7,55.1,-57.9,37.6C-63.1,20,-64.4,4.2,-62.4,-11.7C-60.4,-27.6,-55.2,-43.6,-44.3,-54.3C-33.4,-65,-16.7,-70.4,-1.2,-69C14.3,-67.5,28.6,-59.4,43.1,-49.3Z"
										transform="translate(100 90)"
									/>
								</svg>

								<img
									src="/imgs/svgs/homepage/build.svg"
									alt="Community place"
									class="max-w-[300px] mx-auto w-full xs:w-auto"
								/>
							</div>
							<div class="max-h-full mt-auto ml-auto w-fit">
								<CallToAction center="right" text="Log in" link="/login" />
								<!-- <button
									on:click={() => {}}
									class="text-white btn bg-light_primary dark:bg-dark_primary hover:bg-light_primary_dark dark:hover:bg-dark_primary_light"
									type="button">Log In</button
								> -->
							</div>
						</div>
					</slot>
				</GridLayout>
			</div>
		</section>
		<section id="section2" class="grid">
			<!-- style={`grid-template-columns: ${BAR_SECTIONS['SECTION2']} 1fr;`} -->
			<div />
			<div class="relative">
				<LineConnectorWithTitle
					title="Test creator"
					lineColor={'var(--success)'}
					icon="mdi:generator-portable"
				>
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
						Create tests using simple and user friendly enviroment with plenty
						of options
					</p>
				</LineConnectorWithTitle>
				<GridLayout>
					<slot slot="a">
						<div class="flex flex-col justify-between h-full">
							<h3
								class="mb-auto font-medium text-light_text_black dark:text-dark_text_white"
							>
								<span class="font-semibold text-h6 md:text-h4"
									>Create tests</span
								>
								<span class="text-body1 md:text-h6 dark:text-dark_text_white"
									>using several question types, add comments, marking system
									and customize behaviour of the test</span
								>
							</h3>
							<Space gap={10} />
							<div>
								<svg
									class="highlight_effect"
									viewBox="0 0 200 200"
									xmlns="http://www.w3.org/2000/svg"
									style="transition-delay: 100ms;"
									use:intersect
									on:intersect={(e) => {
										e.currentTarget.classList.add('active');
									}}
									on:unintersect={(e) => {
										e.currentTarget.classList.remove('active');
									}}
								>
									<path
										class="fill-light_primary dark:fill-dark_primary"
										d="M43.1,-49.3C57.5,-39.2,72.1,-27.3,70.5,-15.5C68.9,-3.8,51.1,7.7,41.5,23.6C31.9,39.5,30.5,59.7,19.3,72.2C8,84.6,-13.1,89.3,-28.3,81.9C-43.4,74.5,-52.7,55.1,-57.9,37.6C-63.1,20,-64.4,4.2,-62.4,-11.7C-60.4,-27.6,-55.2,-43.6,-44.3,-54.3C-33.4,-65,-16.7,-70.4,-1.2,-69C14.3,-67.5,28.6,-59.4,43.1,-49.3Z"
										transform="translate(100 90)"
									/>
								</svg>
								<img
									src="/imgs/online_test.svg"
									alt="Community place"
									class="max-w-[300px] mx-auto w-full xs:w-auto"
								/>
								<Space gap={36} />
								<CallToAction
									text={'Visit'}
									center="right"
									link={'/dashboard/test-creator'}
								>
									<iconify-icon
										icon="material-symbols:arrow-right-alt-rounded"
									/>
								</CallToAction>
							</div>
						</div>
					</slot>
					<slot slot="b">
						<div class="grid grid-cols-6">
							<div class="col-span-3">
								<h3
									class="max-w-full text-light_text_black text-body1 md:text-h5 dark:text-dark_text_white"
								>
									<b>Import</b> and <b>export</b> your tests in GIFT format compatible
									with other platforms.
								</h3>
							</div>
							<div class="relative col-span-3">
								<img
									src="/imgs/svgs/homepage/transfer.svg"
									alt="Community place"
									class="max-w-[300px] mx-auto w-full xs:w-auto"
								/>
							</div>
						</div>
					</slot>
					<slot slot="c">
						<div class="grid grid-cols-6 gap-2">
							<div class="relative col-span-3">
								<img
									src="/imgs/svgs/homepage/programming.svg"
									alt="Community place"
									class="max-w-[300px] mx-auto object-contain w-full"
								/>
							</div>
							<div class="col-span-3">
								<h3
									class="max-w-full text-light_text_black text-body1 md:text-h5 dark:text-dark_text_white"
								>
									Make your own <b>programming</b> assignments and try others in
									VS Code integrated editor
								</h3>
							</div>
						</div>
					</slot>
				</GridLayout>
			</div>
		</section>
		<section id="section3" class="grid">
			<!-- style={`grid-template-columns: ${BAR_SECTIONS['SECTION2']} 1fr;`} -->
			<div />
			<div class="relative">
				<LineConnectorWithTitle
					title="Programming"
					lineColor={'var(--warning)'}
					icon="solar:programming-linear"
				>
					<h2
						class="font-bold text-h5 xs:text-h4 sm:text-h3 md:text-h2 lg:text-h1 text-warning"
					>
						<span
							class="font-normal text-light_text_black dark:text-dark_text_white text-body1"
							>The</span
						>
						Programming UI
					</h2>
					<p
						class="text-body2 md:text-body1 text-light_text_black dark:text-dark_text_white"
					>
						Create programming assignments, be able to try them in VS Code
						integrated editor with compilation included
					</p>
				</LineConnectorWithTitle>
				<div class="-translate-y-[80%] mockup-code" id="programming__mockup">
					{#each codeLines as line, index}
						<pre
							data-prefix={index + 1}
							class={`${
								index === 0 ? 'bg-warning text-warning-content' : ''
							}`}><code
								use:intersect
								on:intersect={() => (line[1] = true)}
								on:unintersect={() => (line[1] = false)}
								use:handwrite={{ enabled: !!line[1], delay: index * 500 }}
								>{line[0]}</code
							></pre>
					{/each}
					<!-- <pre data-prefix="1"><code use:intersect
							>Create your own programming assignments,</code
						></pre>
					<pre data-prefix="2"><code
							>test cases and add hints the participants!</code
						></pre>
					<pre data-prefix="3"><code /></pre>
					<pre data-prefix="4"><code
							>Try out others tasks in VS Code integrated editor.</code
						></pre> -->
				</div>
			</div>
		</section>
		<Space gap={200} />
		<section
			id="section4"
			use:intersect
			on:intersect={() => (displayMore = true)}
			on:unintersect={() => (displayMore = false)}
		>
			<div class="mx-auto w-fit">
				{#if displayMore}
					<div
						class="flex justify-center gap-1 font-extrabold text-center text-h1"
					>
						{#each 'And so much more...' as letter, index (letter + index)}
							<div
								in:fly|global={{
									duration: 550,
									delay: index * 150,
									x: 100
								}}
							>
								{#if letter === ' '}
									<span class="opacity-0 pointer-events-none">|</span>
								{:else}
									{letter}
								{/if}
							</div>
						{/each}
					</div>
					<div
						class="h-2 more-underline bg-warning"
						style="--duration: {550 + 'And so much more...'.length * 150}ms;"
					/>
				{/if}
			</div>
		</section>
		<!-- <section id="section3" class="relative">
			<Space gap={300} />
			<Space gap={300} />
			<h2
				class="relative z-[1000] font-bold text-white text-h1 text-center opacity-0 translate-y-[-800px]"
				id="about-text"
			>
				Want to know more?
			</h2>
			<Space gap={100} />
			<a
				id="about-button"
				href="/about"
				class="text-white absolute bottom-[0] left-1/2 -translate-x-1/2 z-[100000] outline-2 outline outline-white px-6 py-2"
				>About Effio</a
			>
			<Space gap={400} />
		</section> -->
	</div>
	<Space gap={200} />
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
		grid-template-rows: auto max(
				calc(100vh - var(--y-padding) * 2 - var(--nav-height) - var(--gap)),
				1fr
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

	.pros__text-appear {
		opacity: 0;
		transform: translateY(-100%);
		animation: textAppear 1s var(--delay) forwards ease;
	}

	@keyframes textAppear {
		from {
			opacity: 0;
			transform: translateY(-100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	.highlight_effect {
		position: absolute;
		width: 80%;
		left: 50%;
		z-index: -99;
		transform: translateX(-50%);
		filter: blur(60px);
		opacity: 0;
		scale: 1;
		transition: 0.6s ease;
	}

	:global(.active).highlight_effect {
		opacity: 0.6 !important;
		scale: 1;
		transition-delay: 300ms;
	}

	.drop-effect {
		filter: drop-shadow(0px 0px 0px var(--light-terciary));
		transition: 0.6s ease-in-out;
		transition-delay: 200ms;
	}

	:global(.dark) .drop-effect {
		filter: drop-shadow(0px 0px 0px var(--dark-primary));
	}

	:global(.active).drop-effect {
		filter: drop-shadow(0px 0px 20px var(--light-terciary));
	}

	:global(.dark) :global(.active).drop-effect {
		filter: drop-shadow(0px 0px 20px var(--dark-primary));
	}

	@keyframes blob_scale {
		from {
			scale: 0.95;
		}
		to {
			scale: 1.05;
		}
	}

	@keyframes more_underline {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	.more-underline {
		width: 0;
		animation: more_underline var(--duration) forwards
			cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
</style>
