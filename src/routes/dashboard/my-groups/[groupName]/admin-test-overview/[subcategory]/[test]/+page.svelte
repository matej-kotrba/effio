<script lang="ts">
	import Chart, { type ChartConfiguration } from 'chart.js/auto';
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
	import { goto } from '$app/navigation';
	import { getIndexOfMark, getMarkBasedOnPoints } from '~helpers/test/test';
	import { page } from '$app/stores';
	import IconButton from '~components/buttons/IconButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import { resetUsersAttemptsSchema } from '~/routes/dashboard/my-groups/schemas';
	import { superForm } from 'sveltekit-superforms/client';
	import toast from 'svelte-french-toast';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';

	export let data;

	let openResetUsersAttemptsDialog: () => void;
	let closeResetUsersAttemptsDialog: () => void;

	const {
		form: formUsersAttempts,
		errors: errorsUsersAttempts,
		enhance: enhanceUsersAttempts,
		submitting: submittingUsersAttempts,
		reset: resetUsersAttempts
	} = superForm(data.resetUsersAttempts, {
		resetForm: true,
		validators: resetUsersAttemptsSchema
	});

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
			id: 'bestMark',
			accessorKey: 'bestMark',
			header: 'Best mark',
			cell: (info) => info.getValue()
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
		id: string;
		userName: string;
		userIcon: string;
		numberOfTries: number;
		bestMark: string | undefined;
		takenAt: Date | undefined;
		didTakenTest: boolean;
	};

	const tableData: TableData[] = data.group.users
		.filter((user) => user.userId !== data.group.ownerId)
		.map((user) => {
			const usersTestRecords = data.testRecords.filter((item) => {
				return item.userId === user.userId;
			});

			const userResults = usersTestRecords.map((item) => {
				return {
					userPoints: item.userPoints,
					maxPoints: item.test.totalPoints
				};
			});

			let bestRatio = 0;
			let bestRatioResultIndex = 0;
			let markSystem: ReturnType<typeof checkMarkSystem> | null = null;

			if (userResults.length > 0) {
				userResults.forEach((item, index) => {
					const ratio = item.userPoints / item.maxPoints;
					if (ratio > bestRatio) {
						bestRatio = ratio;
						bestRatioResultIndex = index;
					}
				});

				markSystem = checkMarkSystem(
					usersTestRecords[bestRatioResultIndex].test.markSystemJSON
				);
			}

			return {
				id: user.userId || '',
				userName: user.user!.name || '',
				userIcon: user.user!.image || '',
				numberOfTries: usersTestRecords.length,
				takenAt: usersTestRecords[0]
					? usersTestRecords[0].createdAt
					: undefined,
				bestMark:
					markSystem === null
						? 'x'
						: getMarkBasedOnPoints(
								markSystem,
								userResults[bestRatioResultIndex].maxPoints,
								userResults[bestRatioResultIndex].userPoints
						  ).name,
				didTakenTest: usersTestRecords.length > 0
			};
		});

	function onTableRowClick(row: TableData) {
		goto(`${$page.url.pathname}/${row.id}`);
	}

	function collapseUsersTable() {
		isTableCollapsed = !isTableCollapsed;
	}

	// let questionAveragesCanvases: HTMLCanvasElement[] = [];

	let overallAverageGraph: HTMLCanvasElement;
	let markDistributionGraph: HTMLCanvasElement;
	let takenAtGraph: HTMLCanvasElement;

	let isTableCollapsed: boolean = false;

	onMount(() => {
		if (!data.avarage) return;

		const overallConfig = {
			type: 'bar',
			data: {
				labels: [''],
				datasets: [
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
				maintainAspectRatio: false,
				scales: {
					x: {
						beginAtZero: true,
						ticks: {
							callback: function (value) {
								return value + '%';
							}
						}
					},
					y: {
						stacked: true
					}
				},
				plugins: {
					legend: {
						display: false,
						align: 'center',
						position: 'bottom',
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						onClick: () => {}
					}
				}
			}
		} satisfies ChartConfiguration;

		const markData =
			markSystem?.map((item) => {
				const count = data.testRecords.filter((record) => {
					if (!markSystem) return false;
					const mark = getMarkBasedOnPoints(
						markSystem,
						record.userPoints,
						record.test.totalPoints
					);
					return mark.name === item.name && mark.limit === item.limit;
				}).length;
				return count;
			}) || [];

		const markConfig = {
			type: 'pie',
			data: {
				labels: markSystem?.map((item) => item.name),
				datasets: [
					{
						label: 'Count',
						data: markData, // The actual value
						backgroundColor: markData.map((item, index) => {
							return `hsl(${(index * 360) / markData.length}, 80%, 50%)`;
						})
					}
				]
			},
			options: {
				indexAxis: 'y',
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						align: 'center',
						position: 'bottom'
						// eslint-disable-next-line @typescript-eslint/no-empty-function
					}
				}
			}
		} satisfies ChartConfiguration;

		const ctx = overallAverageGraph.getContext('2d');
		const markCtx = markDistributionGraph.getContext('2d');
		//@ts-ignore
		let chart = new Chart(ctx, overallConfig);
		//@ts-ignore
		let markChart = new Chart(markCtx, markConfig);
		//@ts-ignore

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
	});
</script>

<Dialog
	isSubmitting={$submittingUsersAttempts}
	bind:open={openResetUsersAttemptsDialog}
	bind:close={closeResetUsersAttemptsDialog}
	title="Reste users attempts"
>
	<form
		method="POST"
		action="?/resetUsersAttempts"
		use:enhanceUsersAttempts={{
			onResult: ({ result }) => {
				if (result['status'] === 200) {
					toast.success('Channel created successfully!');
					closeResetUsersAttemptsDialog();
				} else if (result['type'] === 'failure') {
					console.log(result);
					toast.error(
						result.data?.error ? result['data']['error'] : 'Error ocurred'
					);
				}
			}
		}}
	>
		<input type="hidden" name="testId" value={data.testId} />
		<input
			type="hidden"
			name="subcategoryId"
			value={data.group.groupsSubcategories.find(
				(subcategory) => subcategory.slug === data.subcategorySlug
			)?.id}
		/>
		<p>You are about to reset all users attempts, do you want to continue?</p>
		<div class="flex justify-end gap-2 mt-1">
			<SimpleButton variant="ghost" onClick={closeResetUsersAttemptsDialog}
				>Cancel</SimpleButton
			>
			<SimpleButton
				variant="filled"
				designType="primary"
				type="submit"
				disabled={!!$errorsUsersAttempts.testId?.length ||
					!!$errorsUsersAttempts.subcategoryId?.length}>Reset</SimpleButton
			>
		</div>
	</form>
</Dialog>
<div class="@container">
	<h3 class="text-h4">{data.test.title}</h3>
	<div class="grid gap-x-8 grid-cols-1 @3xl:grid-cols-2">
		<div class="grid grid-cols-12 col-span-2 gap-2">
			<GraphContainer class="flex flex-col justify-between col-span-5">
				<span class="font-semibold">Avarage achieved score</span>
				<canvas
					bind:this={overallAverageGraph}
					width="400"
					class="w-full max-h-[200px]"
				/>
			</GraphContainer>
			{#if markSystem}
				{@const mark = getMarkBasedOnPoints(markSystem, data.avarage, 1)}
				{@const markIndex = getIndexOfMark(markSystem, mark)}
				<GraphContainer class="grid grid-rows-[auto_1fr] col-span-3">
					<span class="font-semibold">Avarage mark</span>
					<div class="grid place-content-center">
						<span class="font-semibold leading-8 text-h4">{mark.name}</span>
						<span
							class="text-center text-light_text_black_60 text-body2 dark:text-dark_text_white_60"
							>{(markIndex > 0
								? markSystem[markIndex].limit + '% - '
								: '100% - ') +
								mark.limit +
								'%'}</span
						>
					</div>
				</GraphContainer>
				<GraphContainer class="flex flex-col justify-between col-span-4">
					<span class="font-semibold">Mark distribution</span>
					<canvas
						bind:this={markDistributionGraph}
						width="400"
						class="w-full max-h-[200px]"
					/>
				</GraphContainer>
			{/if}
		</div>
		<div class="col-span-2 my-4">
			<IconButton
				icon={'carbon:reset'}
				tooltip="Reset attemps for all users"
				onClick={openResetUsersAttemptsDialog}
			/>
		</div>
		<div>
			<table class="table text-body1">
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
				<table class="table mt-1 text-body1">
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
		<div class="flex items-center justify-between col-span-2 my-2">
			<h5 class="font-semibold text-h6">User's test statistics</h5>
			<button
				type="button"
				class="grid p-2 duration-100 rounded-lg hover:bg-light_grey dark:hover:bg-dark_light_grey place-content-center"
				on:click={collapseUsersTable}
			>
				<iconify-icon
					icon="iconamoon:arrow-down-2-duotone"
					class="text-3xl duration-100 {isTableCollapsed
						? 'rotate-180'
						: 'rotate-0'}"
				/>
			</button>
		</div>
		<div class="col-span-2 collapsible {isTableCollapsed ? 'collapsed' : ''}">
			<div>
				<Table {columns} data={tableData} onRowClick={onTableRowClick} />
			</div>
		</div>
		<!-- <div class="col-span-2 mt-8">
			<h5 class="font-semibold text-h6">Question statistics</h5>
			{#each data.test as question}
			{/each}
		</div> -->
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

<style>
	.collapsible {
		display: grid;
		grid-template-rows: 1fr;
		transition: grid-template-rows 0.3s ease;
	}

	.collapsible > div {
		overflow: hidden;
	}

	.collapsible:global(.collapsed) {
		grid-template-rows: 0fr;
	}
</style>
