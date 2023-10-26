<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import Counter from '~components/informatic/Counter.svelte';
	import { applicationStates } from '~stores/applicationStates.js';
	import GraphContainer from './GraphContainer.svelte';
	import { createVerticalBarChartConfig } from './graphsMethods';

	export let data;

	let questionAverages: HTMLCanvasElement[] = [];

	let overallAverageGraph: HTMLCanvasElement;
	onMount(() => {
		if (!data.avarage) return;

		const overallConfig = createVerticalBarChartConfig(
			data.totalPoints,
			data.avarage,
			$applicationStates.darkMode.isDarkMode
		);

		const ctx = overallAverageGraph.getContext('2d');
		//@ts-ignore
		let chart = new Chart(ctx, overallConfig);

		const questionAveragesConfigs: ReturnType<
			typeof createVerticalBarChartConfig
		>[] = data.pointsQuestionData.map((avarageData) => {
			return createVerticalBarChartConfig(
				avarageData.totalPoints,
				avarageData.averagePoints,
				$applicationStates.darkMode.isDarkMode
			);
		});
	});

	console.log(data.pointsQuestionData);
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
		<canvas bind:this={overallAverageGraph} width="400" class="w-full" />
	</GraphContainer>
	{#each data['pointsQuestionData'] as questionData, index}
		<GraphContainer class="col-span-2">
			<canvas bind:this={questionAverages[index]} width="400" class="w-full" />
		</GraphContainer>
	{/each}
</div>
