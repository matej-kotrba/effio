<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartData, ChartConfiguration } from 'chart.js/auto/auto';
	import { applicationStates } from '~stores/applicationStates';

	export let data;

	let portfolio: HTMLCanvasElement;
	let portfolioRecords: HTMLCanvasElement;

	let templates: QuestionTemplate[] = [];

	async function getTemplates() {
		templates = (await trpc(
			$page
		).getQuestionsTypes.query()) as unknown as QuestionTemplate[];
	}

	onMount(async () => {
		const graphData: ChartData = {
			labels: data.testCreationData?.map((data) => data.period),
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
		const config: ChartConfiguration = {
			type: 'bar',
			data: graphData,
			options: {
				clip: 1,
				// @ts-ignore
				borderRadius: '5',
				responsive: true,
				spacing: 0,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							precision: 0
						}
					}
				},
				plugins: {
					legend: {
						position: 'bottom',
						display: false,
						labels: {
							usePointStyle: true,
							padding: 10,
							font: {
								size: 14
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
						text: 'Tests created monthly',
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
		};

		const graphRecordsData: ChartData = {
			labels: data.testTakenData?.map((data) => data.period),
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
					minBarLength: 20
				}
			]
		};
		const configRecords: ChartConfiguration = {
			type: 'bar',
			data: graphRecordsData,
			options: {
				clip: 1,
				// @ts-ignore
				borderRadius: '5',
				responsive: true,
				spacing: 0,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							precision: 0
						}
					}
				},
				plugins: {
					legend: {
						position: 'bottom',
						display: true,
						labels: {
							usePointStyle: true,
							padding: 10,
							font: {
								size: 14
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
						text: 'Tests taken monthly',
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
		};

		const ctx = portfolio.getContext('2d');
		const ctxRecords = portfolioRecords.getContext('2d');

		if (ctx && ctxRecords) {
			let chart = new Chart(ctx, config);
			let chartRecords = new Chart(ctxRecords, configRecords);
		}

		// getTemplates();
	});
</script>

<div
	class="mx-auto max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 place-items-center"
>
	<div class="w-full">
		<canvas bind:this={portfolio} width="400" class="w-full" />
	</div>
	<div class="w-full">
		<canvas bind:this={portfolioRecords} width="400" class="w-full" />
	</div>
</div>
<!-- <div class="text-primary">
	{#each templates as template}
		<p>{template.name}</p>
	{/each}
</div> -->
