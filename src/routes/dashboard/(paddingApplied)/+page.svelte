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
							display: true,
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

		chartTags?.update();
		$applicationStates.darkMode.isDarkMode;
	}
</script>

<!-- <div>
	{#if data.recentlyCompletedTests && data.recentlyCompletedTests.length > 0}
		{#each data.recentlyCompletedTests as test}
			<CardAlternative
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
			/>
		{/each}
	{/if}
</div> -->
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

<div class="max-w-[1200px] @container">
	<div
		class="flex flex-col @2xl:grid gap-4 mx-auto mt-8 place-items-center grid__container"
	>
		<div
			style="grid-area: a;"
			class="w-full h-full p-1 border-2 border-solid rounded-lg sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
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
			style="grid-area: b;"
			class="w-full h-full gap-1 p-1 border-2 border-solid rounded-lg sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
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
			style="grid-area: c;"
			class="w-full h-full gap-1 p-1 overflow-hidden border-2 border-solid rounded-lg sm:p-4 border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
		>
			<h3 class="font-bold text-h6">Average test percentage</h3>

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
	</div>
</div>
<Space gap={150} />

<style>
	.grid__container {
		grid-template-areas: 'a a b b' 'c c d e';
		grid-auto-columns: 1fr;
		grid-auto-rows: fit-content;
	}
</style>
