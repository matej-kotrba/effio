<script lang="ts">
	import type { ChartConfiguration } from 'chart.js';
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import Counter from '~components/informatic/Counter.svelte';
	import { applicationStates } from '~stores/applicationStates.js';
	import GraphContainer from './GraphContainer.svelte';

	export let data;

	let portfolio: HTMLCanvasElement;
	onMount(() => {
		const config: ChartConfiguration = {
			type: 'bar',
			data: {
				labels: [''],
				datasets: [
					{
						label: 'Maximum',
						data: [data.totalPoints], // The total range (maximum value)
						backgroundColor:
							getComputedStyle(document.documentElement).getPropertyValue(
								$applicationStates.darkMode.isDarkMode
									? '--dark-text-white-20'
									: '--light-text-black-20'
							) || '#6722e6' // Maximum segment color with transparency
					},
					{
						label: 'Average',
						data: [data.avarage], // The actual value
						backgroundColor:
							getComputedStyle(document.documentElement).getPropertyValue(
								$applicationStates.darkMode.isDarkMode
									? '--dark-primary'
									: '--light-primary'
							) || '#6722e6' // Maximum segment color with transparency // Actual Value segment color with transparency
					}
				]
			},
			options: {
				indexAxis: 'y',
				scales: {
					x: {
						beginAtZero: true
					},
					y: {
						stacked: true
					}
				},
				plugins: {
					legend: {
						display: true,
						align: 'center',
						position: 'bottom',
						onClick: () => {}
					}
				}
			}
		};

		const ctx = portfolio.getContext('2d');
		//@ts-ignore
		let chart = new Chart(ctx, config);
	});
</script>

<div class="grid grid-cols-12 gap-2 p-2">
	<GraphContainer class="flex flex-col items-center col-span-2 gap-1">
		<span class="font-semibold text-h4">Taken by</span>
		<Counter count={42} />
		<span class="mt-auto text-body4 text-light_text_black_60"
			>*Also includes duplicate completion</span
		>
	</GraphContainer>
	<GraphContainer class="col-span-3">
		<span class="font-semibold">Avarage achieved score</span>
		<canvas bind:this={portfolio} width="400" class="w-full" />
	</GraphContainer>
</div>
