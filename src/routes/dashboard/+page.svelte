<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartData, ChartConfiguration } from 'chart.js/auto/auto';

	export let data;

	let portfolio: HTMLCanvasElement;

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
							'--light-primary'
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
						display: true,
						labels: {
							usePointStyle: true,
							padding: 10,
							font: {
								size: 14
							}
						}
					},
					title: {
						display: true,
						text: 'Tests created monthly'
					}
				}
			}
		};
		const ctx = portfolio.getContext('2d');
		if (ctx) {
			let chart = new Chart(ctx, config);
		}

		getTemplates();
	});
</script>

<div class="">
	<canvas class="w-2" bind:this={portfolio} width="400" />
</div>
<div class="text-primary">
	{#each templates as template}
		<p>{template.name}</p>
	{/each}
</div>
