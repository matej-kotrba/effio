<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartData, ChartConfiguration } from 'chart.js/auto/auto';
	import { applicationStates } from '~stores/applicationStates';
	import OverviewLinks from '~components/page-parts/OverviewLinks.svelte';
	import { IMAGE_IMPORT_SIZE_IN_MB } from '~helpers/constants.js';
	import toast from 'svelte-french-toast';

	export let data;

	let portfolio: HTMLCanvasElement;
	let portfolioRecords: HTMLCanvasElement;

	let templates: QuestionTemplate[] = [];

	async function getTemplates() {
		templates = (await trpc(
			$page
		).getQuestionsTypes.query()) as unknown as QuestionTemplate[];
	}

	let imageRef: HTMLImageElement | null = null;
	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (imageRef === null || !e.currentTarget.files) return;
		const file = e.currentTarget.files[0];

		if (!file) return;

		if (file.size > IMAGE_IMPORT_SIZE_IN_MB * 1024 * 1024) {
			toast.error(
				'Sorry, your image is too large, maximum is ' +
					IMAGE_IMPORT_SIZE_IN_MB +
					'MB'
			);
			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = (e) => {
			imageRef!.src = reader.result as string;
		};
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
	});
</script>

<OverviewLinks />
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

<div
	class="relative grid duration-100 border-2 border-dashed rounded-md group w-28 border-light_text_black_80 dark:border-dark_text_white_80 aspect-square place-content-center hover:bg-light_white dark:hover:bg-dark_quaternary"
>
	<input
		type="file"
		on:change={onImageUpload}
		accept="image/jpeg, image/png, image/jpg, image/webp, image/avif"
		class="absolute w-full h-full opacity-0 cursor-pointer"
	/>
	<div
		class="absolute w-full overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-md pointer-events-none aspect-square left-1/2 top-1/2"
	>
		<img
			bind:this={imageRef}
			src=""
			alt="Group icon"
			class="object-cover w-full h-full text-transparent"
		/>
	</div>
	<iconify-icon
		icon="uil:plus"
		class="text-5xl pointer-events-none group-hover:z-10 drop-shadow-md"
	/>
</div>
