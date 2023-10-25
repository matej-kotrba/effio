<script lang="ts">
	import type { ChartConfiguration } from 'chart.js';
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import { applicationStates } from '~stores/applicationStates.js';

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
						display: false
					}
				}
			}
		};

		const ctx = portfolio.getContext('2d');
		//@ts-ignore
		let chart = new Chart(ctx, config);
	});
</script>

<div class="p-2">
	<div class="w-[300px] p-4 bg-light_whiter shadow-md rounded-md">
		Avarage achieved score
		<canvas bind:this={portfolio} width="400" class="w-full" />
	</div>
	<pre>
    <code>
      {JSON.stringify(data['avarage'], null, 2)}
    </code>
  </pre>
</div>
