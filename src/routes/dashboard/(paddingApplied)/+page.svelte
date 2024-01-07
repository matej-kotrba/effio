<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type {
		ChartData,
		ChartConfiguration,
		ChartType
	} from 'chart.js/auto/auto';
	import { applicationStates } from '~stores/applicationStates';
	import OverviewLink from '~components/page-parts/OverviewLink.svelte';
	import { months } from '~helpers/constants.js';

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

		// Avarage test percentage graph

		const avarageScoreConfig: ChartConfiguration = {
			type: 'doughnut',
			data: {
				labels: ['Correct', 'Incorrect'],
				datasets: [
					{
						label: 'Correct',
						data: [
							data.testAvarageResult !== undefined
								? +(
										data.testAvarageResult.userPoints /
										(data.testAvarageResult.maxPoints / 100)
								  ).toFixed(1)
								: 0,
							data.testAvarageResult !== undefined
								? +(
										100 -
										data.testAvarageResult.userPoints /
											(data.testAvarageResult.maxPoints / 100)
								  ).toFixed(1)
								: 0
						],

						backgroundColor: ['#48f542', '#fc4747']
					}
				]
			},
			options: {
				animation: {
					delay: 200
				},
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								let label = context.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed !== undefined) {
									label += context.parsed + '%';
								}
								return label;
							}
						}
					},
					title: {
						display: false
					}
				}
			}
		};
		if (
			data.testAvarageResult !== undefined &&
			data.testAvarageResult.count > 0
		) {
			activeStates.chartAvarage = true;
		}

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
		const ctxAvarage = avarageMarkingCanvas.getContext('2d');
		const ctxTags = canvasTag.getContext('2d');

		if (ctx && ctxRecords && ctxAvarage && ctxTags) {
			chart = new Chart(ctx, testsCreatedConfig);
			chartRecords = new Chart(ctxRecords, testsTakenConfig);
			chartAvarage = new Chart(ctxAvarage, avarageScoreConfig);
			chartTags = new Chart(ctxTags, tagsConfig);
		}
	});

	$: {
		updateChartColors(chart);
		updateChartColors(chartRecords);

		$applicationStates.darkMode.isDarkMode;
	}
</script>

<div class="flex flex-wrap justify-center gap-4 xs:justify-start">
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
</div>

<div
	class="grid grid-cols-1 gap-4 mx-auto mt-8 lg:grid-cols-2 place-items-center"
>
	<div
		class="w-full h-full p-4 border-2 border-solid rounded-lg border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
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
		class="w-full h-full p-4 border-2 border-solid rounded-lg border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
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
		class="relative flex flex-col w-full h-full p-4 border-2 border-solid rounded-lg border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
	>
		<div class="w-full">
			<h3 class="font-bold text-h6">Avarage test percentage</h3>
			<p>From {data.testAvarageResult?.count} test(s)</p>
		</div>
		<div class="relative">
			<div
				class={`absolute grid w-full h-full shadow-md bg-light_text_black_10 backdrop-blur-2xl place-content-center rounded-2xl ${
					activeStates.chartAvarage ? 'hidden' : ''
				}`}
			>
				<span class="font-semibold">No data to display</span>
			</div>
			<div class="h-full mx-auto">
				<canvas bind:this={avarageMarkingCanvas} width="400" />
			</div>
		</div>
	</div>
	<div
		class="w-full h-full p-4 border-2 border-solid rounded-lg border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
	>
		<h3 class="font-bold text-h6">Avarage test percentage</h3>

		<div class="relative">
			<div
				class={`absolute grid w-full h-full shadow-md bg-light_text_black_10 backdrop-blur-2xl place-content-center rounded-2xl ${
					activeStates.chart ? 'hidden' : ''
				}`}
			>
				<span class="font-semibold">No data to display</span>
			</div>
			<div class="w-1/2 mx-auto">
				<canvas bind:this={canvasTag} width="400" />
			</div>
		</div>
	</div>
</div>
