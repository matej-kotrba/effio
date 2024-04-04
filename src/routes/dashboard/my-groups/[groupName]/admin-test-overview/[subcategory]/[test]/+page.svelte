<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import Counter from '~components/informatic/Counter.svelte';
	import { applicationStates } from '~stores/applicationStates.js';
	import GraphContainer from './GraphContainer.svelte';
	import { createVerticalBarChartConfig } from './graphsMethods';
	import Space from '~components/separators/Space.svelte';
	import UserTable from './UserTable.svelte';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[testId]/+page.svelte';
	import { renderComponent, type ColumnDef } from '@tanstack/svelte-table';
	import CustomTableTile from '~components/table/CustomTableTile.svelte';
	import Table from '~components/table/Table.svelte';
	import TableIcon from './TableIcon.svelte';
	import { transformDate } from '~utils/date';
	import ShowIconDependingOnTakingTest from './ShowIconDependingOnTakingTest.svelte';

	export let data;

	let markSystem: MarkSystemJSON['marks'] | null = checkMarkSystem(
		data.test.testVersions[0].markSystemJSON
	);

	const columns: ColumnDef<TableData>[] = [
		{
			id: 'userIcon',
			accessorKey: 'userIcon',
			header: 'User icon',
			cell: (props) =>
				renderComponent(TableIcon, {
					imageUrl: props.row.original.userIcon
				})
		},
		{
			id: 'userName',
			accessorKey: 'userName',
			header: 'Username',
			cell: (info) => info.getValue()
		},
		{
			id: 'takenAt',
			accessorKey: 'takenAt',
			header: 'Lastly taken at',
			cell: (info) => {
				const value = info.getValue();
				if (value instanceof Date || typeof value === 'string') {
					return value ? transformDate(value, { time: true }) : value;
				}
				return 'x';
			}
		},
		{
			id: 'numberOfTries',
			accessorKey: 'numberOfTries',
			header: 'Number of tries',
			cell: (info) => info.getValue()
		},
		{
			id: 'bestPointsInPoints',
			accessorKey: 'bestPointsInPoints',
			header: 'Best result in points',
			cell: (info) => {
				return info.getValue() || 'x';
			}
		},
		{
			id: 'bestPointsInPercentage',
			accessorKey: 'bestPointsInPercentage',
			header: 'Best result in percentage',
			cell: (info) => {
				return info.getValue() || 'x';
			}
		},
		{
			id: 'didTakenTest',
			accessorKey: 'didTakenTest',
			header: 'Did take the test',
			cell: (info) =>
				renderComponent(ShowIconDependingOnTakingTest, {
					didTakeTest: info.getValue() as boolean
				})
		}
	];

	type TableData = {
		userName: string;
		userIcon: string;
		numberOfTries: number;
		bestPointsInPoints: number | undefined;
		bestPointsInPercentage: number | undefined;
		takenAt: Date | undefined;
		didTakenTest: boolean;
	};

	const tableData: TableData[] = data.group.users.map((user) => {
		const usersTestRecords = data.testRecords.filter((item) => {
			return item.userId === user.userId;
		});

		const maximalValue = usersTestRecords.map((item) => item.userPoints);
		const maximalPercentage = usersTestRecords.map(
			(item) => item.userPoints / data.totalPoints
		);

		return {
			userName: user.user!.name || '',
			userIcon: user.user!.image || '',
			numberOfTries: usersTestRecords.length,
			takenAt: usersTestRecords[0] ? usersTestRecords[0].createdAt : undefined,
			bestPointsInPoints:
				maximalValue.length > 0 ? Math.max(...maximalValue) : undefined,
			bestPointsInPercentage: maximalPercentage.length
				? Math.max(...maximalPercentage)
				: undefined,
			didTakenTest: usersTestRecords.length > 0
		};
	});

	function onTableRowClick(row: TableData) {
		console.log(row);
	}

	// let questionAveragesCanvases: HTMLCanvasElement[] = [];

	// let overallAverageGraph: HTMLCanvasElement;

	// onMount(() => {
	// 	if (!data.avarage) return;

	// 	const overallConfig = createVerticalBarChartConfig(
	// 		data.totalPoints,
	// 		data.avarage,
	// 		$applicationStates.darkMode.isDarkMode
	// 	);

	// 	const ctx = overallAverageGraph.getContext('2d');
	// 	//@ts-ignore
	// 	let chart = new Chart(ctx, overallConfig);

	// 	const questionAveragesConfigs: ReturnType<
	// 		typeof createVerticalBarChartConfig
	// 	>[] = data.pointsQuestionData.map((avarageData) => {
	// 		return createVerticalBarChartConfig(
	// 			avarageData.totalPoints,
	// 			avarageData.averagePoints,
	// 			$applicationStates.darkMode.isDarkMode
	// 		);
	// 	});

	// 	questionAveragesCanvases.forEach((item, index) => {
	// 		const ctx = item.getContext('2d');
	// 		//@ts-ignore
	// 		let chart = new Chart(ctx, questionAveragesConfigs[index]);
	// 	});
	// });
</script>

<div class="p-2 @container">
	<h3 class="text-h4">{data.test.title}</h3>
	<div class="grid gap-2 grid-cols-1 @3xl:grid-cols-2">
		<div>
			<table class="table text-body2">
				<tbody>
					<tr>
						<td>Maximal test points</td>
						<td class="font-semibold w-[30%]">{data.totalPoints}</td>
					</tr>
					<tr>
						<td>Test finished by users</td>
						<td class="font-semibold w-[30%]"
							>{data.count} / {data.group.users.length - 1}</td
						>
					</tr>
					<tr>
						<td>Test finished by users in %</td>
						<td class="font-semibold w-[30%]"
							>{(100 * (data.count / (data.group.users.length - 1))).toFixed(
								1
							)}%</td
						>
					</tr>
				</tbody>
			</table>
		</div>
		<div>
			{#if markSystem}
				<table class="table mt-1 text-body2">
					<thead>
						<tr class="text-light_text_black dark:text-dark_text_white">
							<th class="text-body1">Percentage %</th>
							<th class="text-body1">Mark</th>
						</tr>
					</thead>
					<tbody>
						{#each markSystem as mark, index}
							<tr>
								<td
									>{index === 0
										? '100'
										: (markSystem[index - 1].limit || 0) - 1}% -
									{mark.limit}%</td
								>
								<td class="w-[30%]">{mark.name}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
		<!-- on:sorting-change={onTableSortChange}
		bind:tableSelection
		bind:table -->
		<div class="col-span-2">
			<Table {columns} data={tableData} onRowClick={onTableRowClick} />
		</div>
	</div>
</div>

<!-- Title grid -->
<!-- <div class="grid grid-cols-12 p-2 title-grid">
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
</div> -->

<!-- Content grid -->
<!-- <div class="grid grid-cols-12 gap-2 px-2 main-grid @container">
	<GraphContainer
		class="flex flex-col items-center col-span-3 @6xl:col-span-2 gap-1"
	>
		<span class="font-semibold text-h4">Taken by</span>
		<Counter count={data.count} />
		<span
			class="mt-auto text-body4 text-light_text_black_60 dark:text-dark_text_white_60"
			>*Also includes duplicate completion</span
		>
	</GraphContainer>
	<GraphContainer
		class="flex flex-col justify-between col-span-4 @6xl:col-span-3"
	>
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
<Space gap={48} /> -->
<!-- Title grid -->
<!-- <div class="grid grid-cols-12 p-2 title-grid">
	<h5
		class="col-span-5 font-semibold uppercase text-h5 border-b-[1px] border-solid border-light_text_black_20"
	>
		Users
	</h5>
</div> -->
<!-- Content grid -->
<!-- <div class="grid grid-cols-12 gap-2 px-2 main-grid">
	<UserTable
		ownerId={data.group.ownerId}
		omitOwnerFromTable={true}
		displayData={{
			image: true,
			taken: true,
			takenCount: true
		}}
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
</style> -->
