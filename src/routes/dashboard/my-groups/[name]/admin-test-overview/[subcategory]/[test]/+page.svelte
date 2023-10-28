<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import Counter from '~components/informatic/Counter.svelte';
	import { applicationStates } from '~stores/applicationStates.js';
	import GraphContainer from './GraphContainer.svelte';
	import { createVerticalBarChartConfig } from './graphsMethods';
	import Space from '~components/separators/Space.svelte';
	import UserTable from './UserTable.svelte';

	export let data;

	let questionAveragesCanvases: HTMLCanvasElement[] = [];

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

		questionAveragesCanvases.forEach((item, index) => {
			const ctx = item.getContext('2d');
			//@ts-ignore
			let chart = new Chart(ctx, questionAveragesConfigs[index]);
		});
	});
</script>

<!-- Title grid -->
<div class="grid grid-cols-12 p-2 title-grid">
	<h5
		class="col-span-5 font-semibold uppercase text-h5 border-b-[1px] border-solid border-light_text_black_20"
	>
		Overall charts
	</h5>
	<h5
		class="col-span-6 col-start-7 font-semibold uppercase text-h5 border-b-[1px] border-solid border-light_text_black_20"
	>
		Questions
	</h5>
</div>

<!-- Content grid -->
<div class="grid grid-cols-12 gap-2 px-2 main-grid">
	<GraphContainer class="flex flex-col items-center col-span-2 gap-1">
		<span class="font-semibold text-h4">Taken by</span>
		<Counter count={data.count} />
		<span class="mt-auto text-body4 text-light_text_black_60"
			>*Also includes duplicate completion</span
		>
	</GraphContainer>
	<GraphContainer class="flex flex-col justify-between col-span-3">
		<span class="font-semibold">Avarage achieved score</span>
		<canvas bind:this={overallAverageGraph} width="400" class="w-full" />
	</GraphContainer>
	<div
		class="grid grid-cols-6 col-span-6 col-start-7 gap-2 row-span-full main-grid"
	>
		{#each data['pointsQuestionData'] as questionData, index}
			<GraphContainer class="flex flex-col justify-between col-span-3">
				<span class="font-semibold text-body2"
					>{index + 1}. Avarage achieved score for question:
					<div
						class="w-full overflow-hidden font-normal text-body2 whitespace-nowrap text-ellipsis"
					>
						<abbr title={questionData.title} class="no-underline">
							{questionData.title}
						</abbr>
					</div></span
				>
				<canvas
					bind:this={questionAveragesCanvases[index]}
					width="400"
					class="w-full"
				/>
			</GraphContainer>
		{/each}
	</div>
</div>
<Space gap={48} />
<!-- Title grid -->
<div class="grid grid-cols-12 p-2 title-grid">
	<h5
		class="col-span-5 font-semibold uppercase text-h5 border-b-[1px] border-solid border-light_text_black_20"
	>
		Users
	</h5>
</div>
<!-- Content grid -->
<div class="grid grid-cols-12 gap-2 px-2 main-grid">
	<UserTable
		data={{
			groupId: data.group.id,
			subcategorySlug: data.subcategorySlug,
			testId: data.testId
		}}
		class="col-span-12"
	/>
</div>

<style>
	.title-grid {
		grid-template-rows: auto;
	}
	.main-grid {
		grid-auto-rows: 14rem;
	}
	canvas {
		max-height: 140px !important;
	}
</style>
