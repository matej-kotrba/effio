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

	let templates: QuestionTemplate[] = [];

	let chart: Chart;
	let chartRecords: Chart;

	async function getTemplates() {
		templates = (await trpc(
			$page
		).getQuestionsTypes.query()) as unknown as QuestionTemplate[];
	}

	function setupConfig(data: ChartData) {
		return {
			type: 'bar' as ChartType,
			data: data,
			options: {
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
					minBarLength: 20
				}
			]
		};
		const testsCreatedConfig: ChartConfiguration =
			setupConfig(testsCreatedData);

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
		const testsTakenConfig: ChartConfiguration = setupConfig(testsTakenData);

		const ctx = portfolio.getContext('2d');
		const ctxRecords = portfolioRecords.getContext('2d');

		if (ctx && ctxRecords) {
			chart = new Chart(ctx, testsCreatedConfig);
			chartRecords = new Chart(ctxRecords, testsTakenConfig);
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
		class="w-full p-4 border-2 border-solid rounded-lg border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
	>
		<h3 class="font-bold text-h6">Tests created monthly</h3>
		<canvas bind:this={portfolio} width="400" class="w-full" />
	</div>
	<div
		class="w-full p-4 border-2 border-solid rounded-lg border-light_text_black_60 dark:border-dark_text_white_60 dark:bg-dark_text_white_10"
	>
		<h3 class="font-bold text-h6">Tests taken monthly</h3>
		<canvas bind:this={portfolioRecords} width="400" class="w-full" />
	</div>
</div>
