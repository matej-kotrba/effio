<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type {
		ChartData,
		ChartConfiguration,
		ChartType
	} from 'chart.js/auto/auto';
	import { applicationStates } from '~stores/applicationStates';
	import { months } from '~helpers/constants.js';
	import Space from '~components/separators/Space.svelte';
	import { browser } from '$app/environment';
	import Counter from '~components/informatic/Counter.svelte';
	import CardAlternative from '~components/containers/card/CardAlternative.svelte';
	import Carousel from '~components/containers/Carousel.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Star from '~components/globals/Star.svelte';

	export let data;

	let portfolio: HTMLCanvasElement;
	let portfolioRecords: HTMLCanvasElement;
	let avarageMarkingCanvas: HTMLCanvasElement;
	let canvasTag: HTMLCanvasElement;

	let templates: QuestionTemplate[] = [];

	let chart: Chart;
	let chartRecords: Chart;
	let chartAvarage: Chart;
	let chartTags: Chart;

	let activeStates = {
		chart: false,
		chartRecords: false,
		chartAvarage: false,
		chartTags: false
	};

	let dashboardContainerRef: HTMLDivElement;

	function onResize() {
		if (chart) {
			chart.resize();
		}
		if (chartRecords) {
			chartRecords.resize();
		}
		if (chartTags) {
			chartTags.resize();
		}
	}

	async function getTemplates() {
		templates = (await trpc(
			$page
		).getQuestionsTypes.query()) as unknown as QuestionTemplate[];
	}

	function onMouseMove(
		e: MouseEvent & {
			currentTarget: EventTarget & Window;
		}
	) {
		dashboardContainerRef.style.setProperty('--blur-x', `${e.x}px`);
		dashboardContainerRef.style.setProperty('--blur-y', `${e.y}px`);
	}

	function setupConfig(data: ChartData) {
		let delayed = false;
		return {
			type: 'bar' as ChartType,
			data: data,
			options: {
				animation: {
					onComplete: () => {
						delayed = true;
					},
					delay: (context) => {
						let delay = 0;
						if (
							context.type === 'data' &&
							context.mode === 'default' &&
							!delayed
						) {
							delay = context.dataIndex * 300 + context.datasetIndex * 100;
						}
						return delay;
					}
				},
				clip: 1,
				// @ts-ignore
				borderRadius: '5',
				responsive: true,
				spacing: 0,
				scales: {
					x: {
						ticks: {
							color: window
								.getComputedStyle(document.body)
								.getPropertyValue(
									$applicationStates.darkMode.isDarkMode
										? '--dark-text-white-80'
										: '--light-text-black-80'
								)
						}
					},
					y: {
						beginAtZero: true,
						ticks: {
							precision: 0
						}
					}
				},
				plugins: {
					legend: {
						position: 'bottom' as const,
						display: false,
						labels: {
							usePointStyle: true,
							padding: 10,
							font: {
								size: 16
							},
							color: window
								.getComputedStyle(document.body)
								.getPropertyValue(
									$applicationStates.darkMode.isDarkMode
										? '--dark-text-white-80'
										: '--light-text-black-80'
								)
						}
					},
					title: {
						display: true,
						color: window
							.getComputedStyle(document.body)
							.getPropertyValue(
								$applicationStates.darkMode.isDarkMode
									? '--dark-text-white-80'
									: '--light-text-black-80'
							)
					}
				}
			}
		} as ChartConfiguration;
	}

	function updateChartColors(chart: Chart) {
		if (chart?.config?.options?.plugins?.title?.color) {
			if (chart?.config?.options?.scales?.x?.ticks?.color !== undefined) {
				chart.config.options.scales.x.ticks.color = window
					.getComputedStyle(document.body)
					.getPropertyValue(
						$applicationStates.darkMode.isDarkMode
							? '--dark-text-white-80'
							: '--light-text-black-80'
					);
			}
			chart.config.data?.datasets?.forEach((item) => {
				if (item !== undefined) {
					(item.backgroundColor as Array<string>)[0] = getComputedStyle(
						document.documentElement
					).getPropertyValue(
						$applicationStates.darkMode.isDarkMode
							? '--dark-primary'
							: '--light-primary'
					);
					item.borderColor = $applicationStates.darkMode.isDarkMode
						? '#FFFFFF'
						: '#000000';
				}
			});
			chart.update();
		}
	}

	onMount(async () => {
		// Tests create graph

		const testsCreatedData: ChartData = {
			labels: data.testCreationData?.map(
				(data) =>
					`${months[+data.period.substring(5, 7) - 1]} ${data.period.substring(
						0,
						4
					)}`
			),
			datasets: [
				{
					label: 'Tests created',
					data:
						data.testCreationData?.map((data) => Number(data.count) || 0) || [],
					backgroundColor: [
						getComputedStyle(document.documentElement).getPropertyValue(
							$applicationStates.darkMode.isDarkMode
								? '--dark-primary'
								: '--light-primary'
						) || '#6722e6'
					],
					borderWidth: 2,
					minBarLength: 10
				}
			]
		};
		if (
			data.testCreationData !== undefined &&
			data.testCreationData.length > 0
		) {
			activeStates.chart = true;
		}

		const testsCreatedConfig: ChartConfiguration =
			setupConfig(testsCreatedData);

		// Tests taken graph

		const testsTakenData: ChartData = {
			labels: data.testTakenData?.map(
				(data) =>
					`${months[+data.period.substring(5, 7) - 1]} ${data.period.substring(
						0,
						4
					)}`
			),
			datasets: [
				{
					label: 'Tests taken',
					data:
						data.testTakenData?.map((data) => Number(data.count) || 0) || [],
					backgroundColor: [
						getComputedStyle(document.documentElement).getPropertyValue(
							$applicationStates.darkMode.isDarkMode
								? '--dark-primary'
								: '--light-primary'
						) || '#6722e6'
					],
					borderWidth: 2,
					borderColor: getComputedStyle(
						document.documentElement
					).getPropertyValue(
						$applicationStates.darkMode.isDarkMode ? '#FFFFFF' : '#000000'
					),

					minBarLength: 10
				}
			]
		};
		if (data.testTakenData && data.testTakenData.length > 0) {
			activeStates.chartRecords = true;
		}

		const testsTakenConfig: ChartConfiguration = setupConfig(testsTakenData);

		// Tags graph

		const tagsData: ChartData = {
			labels: data.tagsTookTestFromResult?.map((tag) => tag.name) || [],
			datasets: [
				{
					label: 'Tests completed with this tag',
					data:
						data.tagsTookTestFromResult?.map((tag) => Number(tag.count)) || [],
					fill: true,
					backgroundColor: window
						.getComputedStyle(document.body)
						.getPropertyValue(
							$applicationStates.darkMode.isDarkMode
								? '--dark-primary-transparent'
								: '--light-primary-transparent'
						),
					borderColor: window
						.getComputedStyle(document.body)
						.getPropertyValue(
							$applicationStates.darkMode.isDarkMode
								? '--dark-secondary'
								: '--light-secondary'
						),
					pointBackgroundColor: window
						.getComputedStyle(document.body)
						.getPropertyValue(
							$applicationStates.darkMode.isDarkMode
								? '--dark-primary'
								: '--light-primary'
						),
					pointBorderColor: '#fff',
					pointHoverBackgroundColor: '#fff',
					pointHoverBorderColor: window
						.getComputedStyle(document.body)
						.getPropertyValue(
							$applicationStates.darkMode.isDarkMode
								? '--dark-primary'
								: '--light-primary'
						)
				}
			]
		};
		if (
			data.tagsTookTestFromResult !== undefined &&
			data.tagsTookTestFromResult.length > 0
		) {
			activeStates.chartTags = true;
		}

		const tagsConfig: ChartConfiguration = {
			type: 'radar',
			data: tagsData,
			options: {
				maintainAspectRatio: false,
				responsive: true,
				plugins: {
					legend: {
						display: false
					}
				},
				elements: {
					line: {
						borderWidth: 3
					},
					point: {
						radius: 6
					}
				},
				scales: {
					r: {
						suggestedMin: 0,
						ticks: {
							display: false,
							stepSize: 1
						},
						pointLabels: {
							font: {
								size: 18
							},
							color: window
								.getComputedStyle(document.body)
								.getPropertyValue(
									$applicationStates.darkMode.isDarkMode
										? '--dark-text-white'
										: '--light-text-black'
								)
						}
					}
				}
			}
		};

		const ctx = portfolio.getContext('2d');
		const ctxRecords = portfolioRecords.getContext('2d');
		const ctxTags = canvasTag.getContext('2d');

		if (ctx && ctxRecords && ctxTags) {
			chart = new Chart(ctx, testsCreatedConfig);
			chartRecords = new Chart(ctxRecords, testsTakenConfig);
			chartTags = new Chart(ctxTags, tagsConfig);
		}

		window.addEventListener('resize', onResize);
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', onResize);
		}
	});

	$: {
		updateChartColors(chart);
		updateChartColors(chartRecords);

		chartTags?.data.datasets.forEach((item) => {
			//@ts-ignore
			item.pointBackgroundColor = window
				.getComputedStyle(document.body)
				.getPropertyValue(
					$applicationStates.darkMode.isDarkMode
						? '--dark-primary'
						: '--light-primary'
				);
			item.backgroundColor = window
				.getComputedStyle(document.body)
				.getPropertyValue(
					$applicationStates.darkMode.isDarkMode
						? '--dark-primary-transparent'
						: '--light-primary-transparent'
				);
			item.borderColor = window
				.getComputedStyle(document.body)
				.getPropertyValue(
					$applicationStates.darkMode.isDarkMode
						? '--dark-secondary'
						: '--light-secondary'
				);
			// item.pointBackgroundColor = window
			// 	.getComputedStyle(document.body)
			// 	.getPropertyValue(
			// 		$applicationStates.darkMode.isDarkMode
			// 			? '--dark-primary'
			// 			: '--light-primary'
			// 	)
			// item.pointHoverBorderColor = window
			// 	.getComputedStyle(document.body)
			// 	.getPropertyValue(
			// 		$applicationStates.darkMode.isDarkMode
			// 			? '--dark-primary'
			// 			: '--light-primary'
			// 	)
		});

		if (chartTags?.options?.scales?.r && chartTags?.options?.elements?.point) {
			//@ts-ignore
			chartTags.options.scales.r.pointLabels.color = window
				.getComputedStyle(document.body)
				.getPropertyValue(
					$applicationStates.darkMode.isDarkMode
						? '--dark-text-white'
						: '--light-text-black'
				);
		}

		chartTags?.update();
		$applicationStates.darkMode.isDarkMode;
	}
</script>

{#if data.recentlyCompletedTests && data.recentlyCompletedTests.length > 0}
	<h3 class="font-semibold text-h4">Recently took tests</h3>
	<Carousel
		data={data.recentlyCompletedTests.map((item) => {
			return {
				...item.test.testGroup,
				stars: item.test.testGroup._count.stars,
				tags: item.test.testGroup.tags.map((item) => item.tag),
				type: item.test.testGroup.type,
				icon: item.test.testGroup.owner.image,
				img: item.test.testGroup.imageUrl,
				isStarred: item.test.testGroup.stars.length > 0
			};
		})}
	/>
	<!-- {#each data.recentlyCompletedTests as test} -->
	<!-- <CardAlternative
				isStarredDefault={test.test.testGroup.stars !== undefined &&
					test.test.testGroup.stars.length > 0}
				type={test.test.testGroup.type}
				navigationLink={`/tests/${test.test.testGroup.id}`}
				canStarTest={test.test.testGroup.stars !== undefined &&
					!!$page.data.session?.user?.id &&
					$page.data.session.user.id !== test.test.testGroup.ownerId}
				data={{
					...test.test.testGroup,

					stars: test.test.testGroup._count.stars,
					tags: test.test.testGroup.tags.map((item) => item.tag)
				}}
			/> -->
	<!-- {/each} -->
{/if}
<!-- <div class="flex flex-wrap justify-center gap-4 xs:justify-start">
	<OverviewLink
		icon="gridicons:create"
		title="Create a new test"
		link="/dashboard/test-creator"
		bgImage="/imgs/svgs/overview/test.png"
	/>
	<OverviewLink
		icon="fluent:people-community-20-filled"
		title="Visit community"
		link="/community"
		bgImage="/imgs/svgs/overview/community.png"
	/>
</div> -->

<svelte:window on:mousemove={onMouseMove} />

<Space gap={30} />
<h3 class="font-semibold text-h4">Recent activity</h3>
<Separator w={'100%'} h={'1px'} class="mt-2" />
<div
	class="max-w-[1200px] @container"
	bind:this={dashboardContainerRef}
	style="--blur-x: 0px;
		--blur-y: 0px;"
>
	<div
		class="grid @2xl:grid-cols-2 gap-4 mx-auto mt-8 place-items-center grid__container"
	>
		<div
			class="w-full h-full p-1 overflow-y-auto border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
		>
			<h3 class="font-bold text-h6">Tests created monthly</h3>
			<div class="relative">
				<div
					class={`absolute grid w-full h-full shadow-md bg-light_text_black_10 backdrop-blur-2xl place-content-center rounded-2xl ${
						activeStates.chart ? 'hidden' : ''
					}`}
				>
					<span class="font-semibold">No data to display</span>
				</div>
				<canvas bind:this={portfolio} width="400" class="w-full" />
			</div>
		</div>
		<div
			class="w-full h-full gap-1 p-1 overflow-y-auto border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
		>
			<h3 class="font-bold text-h6">Tests taken monthly</h3>
			<div class="relative">
				<div
					class={`absolute grid w-full h-full shadow-md bg-light_text_black_10 backdrop-blur-2xl place-content-center rounded-2xl ${
						activeStates.chartRecords ? 'hidden' : ''
					}`}
				>
					<span class="font-semibold">No data to display</span>
				</div>
				<canvas bind:this={portfolioRecords} width="400" class="w-full" />
			</div>
		</div>

		<div
			class="w-full h-full gap-1 p-1 overflow-y-auto border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
		>
			<h3 class="font-bold text-h6">Tests by tags</h3>

			<div class="relative @container/graph">
				<div
					class={`absolute grid w-full h-full shadow-md bg-light_text_black_10 backdrop-blur-2xl place-content-center rounded-2xl ${
						activeStates.chartTags ? 'hidden' : ''
					}`}
				>
					<span class="font-semibold">No data to display</span>
				</div>
				<div
					class="grid w-full @2xl/graph:w-3/4 p-2 mx-auto place-content-center"
				>
					<canvas bind:this={canvasTag} width="400" />
				</div>
			</div>
		</div>
		{#if data.testAvarageResult}
			<div
				class="grid w-full h-full @lg:grid-cols-2 gap-1 p-1 overflow-y-auto details__container"
			>
				<div
					class="flex flex-col p-2 border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
				>
					<h4 class="font-bold text-body1">Average test rating</h4>
					<div class="flex items-center justify-center flex-1 gap-2">
						<div class="flex items-center w-20">
							<Counter
								class="bg-transparent rounded-none shadow-none dark:bg-transparent"
								count={+data.testAvarageResult.userPoints === 0
									? 0
									: +(
											(data.testAvarageResult.userPoints /
												data.testAvarageResult.maxPoints) *
											100
									  ).toFixed(0)}
							/>
							<span class="text-2xl font-bold"> % </span>
						</div>
					</div>
				</div>
				<div
					class="flex flex-col p-2 border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
				>
					<h4 class="font-bold text-body1">Tests done this month</h4>
					<div class="grid flex-1 place-content-center">
						<Counter
							class="bg-transparent rounded-none shadow-none dark:bg-transparent"
							count={Number(data.testAvarageResult.count)}
						/>
					</div>
				</div>
				<div
					class="flex flex-col p-2 border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
				>
					<h4 class="font-bold text-body1">Tests stared this month</h4>
					<div class="flex items-center justify-center flex-1">
						<Counter
							class="bg-transparent rounded-none shadow-none dark:bg-transparent"
							count={Number(data.gaveStarsInLastMonth.count)}
						/>
						<Star class="text-4xl" />
					</div>
				</div>
				<div
					class="flex flex-col p-2 border-2 border-solid rounded-lg item-box sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
				>
					<h4 class="font-bold text-body1">Stars recieved this month</h4>
					<div class="flex items-center justify-center flex-1">
						<Counter
							class="bg-transparent rounded-none shadow-none dark:bg-transparent"
							count={Number(data.receivedStarsInLastMonth.count)}
						/>
						<Star class="text-4xl" />
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
<Space gap={100} />

<style>
	.details__container {
		grid-auto-rows: auto 1fr;
	}

	.details__container > div {
		grid-row: span 2;
		display: grid;
		grid-template-rows: subgrid;
	}

	.item-box {
		position: relative;
		transition: 0.1s scale ease;
	}

	.item-box::before {
		content: '';
		position: absolute;
		inset: 0px;
		border-radius: inherit;
		background-attachment: fixed;
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--light-primary),
			transparent 8rem
		);
		z-index: -1;
		opacity: 0.15;
		pointer-events: none;
	}

	:global(.dark) .item-box::before {
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--dark-primary),
			transparent 8rem
		);
	}

	:global(.dark) .item-box::before {
		background-image: radial-gradient(
			circle at var(--blur-x, 0) var(--blur-y, 0),
			var(--dark-primary),
			transparent 8rem
		);
	}
</style>
