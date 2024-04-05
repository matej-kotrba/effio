<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Creator from '~components/testCreator/Creator.svelte';
	import FileImport from '~components/inputs/FileImport.svelte';
	import { fly, fade } from 'svelte/transition';
	import { navigating } from '$app/stores';
	import { getTestObject } from '~stores/testObject';
	import {
		initializeNewTestToTestStore,
		isTestValidAndSetErrorsToTestObject
	} from '~helpers/test/test';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import { transformParsedJSONIntoEffioObject } from '~helpers/parsingGIFT.js';
	import toast from 'svelte-french-toast';
	import ProgressNavigation from '~components/navigation/ProgressNavigation.svelte';
	import ProgrammingCreator from '~components/testCreator/ProgrammingCreator.svelte';
	import TestDetails from './TestDetails.svelte';
	import type { TestType } from '@prisma/client';
	import SuccessKeyframe from '~components/effects/SuccessKeyframe.svelte';
	import { validateTestAndRecordIt } from '~helpers/testGroupCalls';
	import { goto } from '$app/navigation';
	import { createTRPCErrorNotification } from '~/lib/utils/notification';
	import { TRPCClientError } from '@trpc/client';
	import { applicationStates } from '~stores/applicationStates';
	import Dialog from '~components/portals/Dialog.svelte';
	import * as Alert from '~components/ui/alert';
	import Tabs from '~components/navigation/Tabs.svelte';
	import Input from '~components/testTaking/Input.svelte';
	import { get } from 'svelte/store';

	export let data;

	const testObject = getTestObject();

	const SECTION_TRANSITION_DURATION = 400;

	let finishModalOpen: () => void;

	initializeNewTestToTestStore(testObject, {
		title: '',
		description: '',
		errors: {},
		questions: []
	});

	let testCreationProgress = {
		templateDone: false,
		constructingDone: false,
		detailsDone: false
	};

	let templates: { title: string; image: string }[] = [
		{ title: 'Blank', image: '/imgs/svgs/empty.svg' }
	];

	let programmingTemplates: { title: string; image: string }[] = [
		{
			title: 'Blank',
			image: '/imgs/svgs/construction.svg'
		}
	];

	let templatesActive: number | undefined = 0;

	let testType: TestType = 'REGULAR';

	$: ($testObject.questions = []), testType;

	let isSubmitting = false;
	let isSuccess = false;

	let testImageFile: File | undefined = undefined;

	let rateLimitError = '';

	let activeTab: 'details' | 'preview' = 'details';

	async function checkTestOnClientAndServerAndPostTestToDB(
		isPublished: boolean,
		testImageFile?: File
	) {
		if (isSubmitting) return;
		isSubmitting = true;

		// Programming tests should not have marking system

		await validateTestAndRecordIt({
			type: 'create',
			data: {
				testObject: testObject,
				title: $testObject.title,
				description: $testObject.description,
				questions: $testObject.questions,
				markSystem: testType === 'PROGRAMMING' ? {} : $testObject.markSystem,
				isPublished: isPublished,
				testType: testType,
				image: testImageFile || undefined,
				tagIds: $testObject.tagIds,
				isRandomized: !!$testObject.randomizeQuestionOrder,
				includedInGroups: $testObject.includedInGroups
			},
			callbacks: {
				onSaveToDB(response) {
					isSuccess = response.success;
					isSubmitting = false;

					if (isSuccess) {
						goto('/dashboard/test-collection');
					}
				},
				onErrorSaveToDB(e) {
					if (e instanceof TRPCClientError) {
						if (e.data.code === 'TOO_MANY_REQUESTS') {
							rateLimitError = e.message;
						} else {
							rateLimitError = '';
						}
						if (e) createTRPCErrorNotification(e);
					}
					isSubmitting = false;
				}
			}
		});
	}

	function handleParsedData(e: CustomEvent) {
		try {
			const questions = transformParsedJSONIntoEffioObject(
				e.detail,
				data.questionTemplates
			);

			if (questions.length === 0) {
				toast.error('This import file seems empty or incorrect 😕');
			}

			$testObject.questions = questions;

			testCreationProgress.templateDone = true;
		} catch (e) {
			console.log(e);
		}
	}

	type Locations = {
		[Key in keyof typeof testCreationProgress]: Key extends `${infer T}Done`
			? T
			: Key;
	}[keyof typeof testCreationProgress];

	function changeLocation(location: Locations) {
		if (location === 'template') {
			testCreationProgress.templateDone = false;
			testCreationProgress.constructingDone = false;
			testCreationProgress.detailsDone = false;
		} else if (location === 'constructing') {
			if (testCreationProgress.templateDone === false) return;
			testCreationProgress.templateDone = true;
			testCreationProgress.constructingDone = false;
			testCreationProgress.detailsDone = false;
		}
		window.scrollTo(0, 0);
	}

	async function onNavigationButtonClick() {
		if (canUserContinue() === false) return;

		if (testCreationProgress.templateDone === false) {
			testCreationProgress.templateDone = true;
		} else if (testCreationProgress.constructingDone === false) {
			const result = isTestValidAndSetErrorsToTestObject({
				questions: $testObject.questions
			});

			$testObject = $testObject;
			if (result['isError']) {
				toast.error(
					result['message'] ||
						'Something with validating your test went wrong 😕'
				);
				return;
			}
			testCreationProgress.constructingDone = true;
		}
		window.scrollTo(0, 0);
	}

	function onTestTypeChangeClick(type: TestType) {
		if (testType === type) return;
		testCreationProgress.templateDone = false;
		testCreationProgress.constructingDone = false;
		testCreationProgress.detailsDone = false;
		testType = type;
		templatesActive = undefined;
	}

	function changeActiveTab(tab: typeof activeTab, direction: -1 | 1) {
		activeTab = tab;
	}

	$: canUserContinue = () => {
		if (!Number.isInteger(templatesActive)) return false;
		if (
			testCreationProgress.constructingDone === false &&
			$testObject.questions.length === 0
		)
			return false;
		return true;
	};

	// Function to scroll on error to specific input
	let scrollToInput: ((index: number) => void) | undefined = undefined;
</script>

<DashboardTitle
	title="Create your new test"
	subtitle="Choose a template and make a new test using many prebuilt inputs."
/>

{#if testCreationProgress.templateDone === true && testCreationProgress.constructingDone === false}
	<div
		transition:fly={{ x: 200 }}
		class={`fixed grid place-content-center z-10
	 shadow-md bottom-2 md:bottom-6 right-2 md:right-6 
		`}
	>
		<button
			type="button"
			on:click={onNavigationButtonClick}
			disabled={!canUserContinue()}
			class={`group grid place-content-center p-1 duration-150 border-2 border-solid rounded-lg md:p-3 bg-light_terciary text-light_whiter
	  disabled:bg-gray-300 disabled:text-light_whiter dark:disabled:bg-dark_terciary border-light_primary dark:border-dark_primary hover:bg-light_whiter hover:text-light_terciary
		disabled:dark:text-dark_text_white_40 dark:bg-dark_quaternary dark:hover:bg-dark_secondary dark:hover:text-dark_text_white`}
		>
			<iconify-icon icon="iconamoon:arrow-right-2-duotone" class="text-5xl" />
		</button>
	</div>
{/if}

<div class="max-w-[98vw] text-sm breadcrumbs">
	<ul class="">
		<li
			class="text-light_text_black dark:text-dark_text_white text-body2"
			class:done={testCreationProgress.templateDone}
		>
			<button type="button" on:click={() => changeLocation('template')}
				>Picking a template</button
			>
		</li>
		<li
			class="text-light_text_black dark:text-dark_text_white text-body2"
			class:done={testCreationProgress.constructingDone}
		>
			<button type="button" on:click={() => changeLocation('constructing')}
				>Constructing a test</button
			>
		</li>
		<li
			class="text-light_text_black dark:text-dark_text_white text-body2"
			class:done={testCreationProgress.detailsDone}
		>
			Details
		</li>
	</ul>
</div>
<h3 class="text-h5 md:text-h4 text-light_text_black dark:text-dark_text_white">
	{#if testCreationProgress.templateDone === false}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Start with picking a template</span
		>
	{:else if testCreationProgress.constructingDone === false}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Construct your test</span
		>
	{:else}
		<span in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}
			>Finishing your test</span
		>
	{/if}
</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="p-1 sm:p-2 @container">
	{#if testCreationProgress.templateDone === false}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{
				x: -300,
				duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
			}}
			class=""
		>
			<div>
				<ProgressNavigation
					defaultActiveIndex={testType === 'REGULAR'
						? 0
						: testType === 'PROGRAMMING'
						? 1
						: -1}
					parts={[
						{
							title: 'Basic test',
							onClick: () => {
								onTestTypeChangeClick('REGULAR');
							}
						},
						{
							title: 'Programming test',
							onClick: () => {
								onTestTypeChangeClick('PROGRAMMING');
							}
						}
					]}
				/>
			</div>
			<Space gap={15} />
			<div class="items-center justify-center xs:justify-start templates-grid">
				{#if testType === 'REGULAR'}
					{#each templates as template, index}
						<TemplateCard
							title={template.title}
							imageSrc={templates[index].image}
							onClick={() => (templatesActive = index)}
							customClasses={index === templatesActive
								? ' border-light_primary dark:border-dark_primary border-4 border-solid shadow-primary dark:shadow-primary_dark shadow-2xl'
								: ' border-transparent border-4 border-solid'}
						/>
					{/each}
					<FileImport
						on:parsedFile={handleParsedData}
						additionalText={'In GIFT format'}
					/>
				{:else if testType === 'PROGRAMMING'}
					{#each programmingTemplates as template, index}
						<TemplateCard
							title={template.title}
							imageSrc={template.image}
							onClick={() => (templatesActive = index)}
							customClasses={index === templatesActive
								? ' border-light_primary dark:border-dark_primary border-4 border-solid shadow-primary dark:shadow-primary_dark shadow-2xl'
								: ' border-transparent border-4 border-solid'}
						/>
					{/each}
				{/if}
			</div>
			<Space />

			<BasicButton
				title="Continue"
				onClick={() => {
					testCreationProgress.templateDone = true;
				}}
				buttonAttributes={{ disabled: !Number.isInteger(templatesActive) }}
			>
				<iconify-icon icon="bxs:right-arrow" class="text-md" />
			</BasicButton>
		</div>
		<!-- Else if  -->
	{:else if testCreationProgress.constructingDone === false}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{
				x: -300,
				duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
			}}
		>
			{#if testType === 'REGULAR'}
				<Creator inputTemplates={data.questionTemplates} bind:scrollToInput />
			{:else if testType === 'PROGRAMMING'}
				<ProgrammingCreator programmingTemplate={data.programmingTemplate} />
			{/if}
			<Space />
		</div>
	{:else}
		<div
			in:fly={{
				x: 300,
				duration: SECTION_TRANSITION_DURATION,
				delay: SECTION_TRANSITION_DURATION
			}}
			out:fly={{
				x: -300,
				duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
			}}
		>
			{#if testType === 'REGULAR'}
				<Tabs
					tabs={[
						{
							title: 'Details',
							slug: 'details',
							onTabSelect: (direction) => changeActiveTab('details', direction)
						},
						{
							title: 'Preview',
							slug: 'preview',
							onTabSelect: (direction) => changeActiveTab('preview', direction)
						}
					]}
					activeTabSlug={activeTab}
				/>
			{/if}
			{#if activeTab === 'details'}
				<div
					in:fly={{
						x: -300,
						duration: SECTION_TRANSITION_DURATION,
						delay: SECTION_TRANSITION_DURATION
					}}
					out:fly={{
						x: -300,
						duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
					}}
				>
					<TestDetails {testType} bind:testImageFile>
						{#if rateLimitError !== ''}
							<Alert.Root variant="destructive">
								<iconify-icon icon="ph:warning" class="text-2xl" />
								<Alert.Title>Rate limit!</Alert.Title>
								<Alert.Description>{rateLimitError}</Alert.Description>
							</Alert.Root>
						{/if}
						<div class="flex justify-center gap-6 my-4">
							<BasicButton
								onClick={() => {
									const result = isTestValidAndSetErrorsToTestObject({
										title: $testObject.title,
										description: $testObject.description,
										questions: $testObject.questions,
										markSystem: $testObject.markSystem
									});

									if (result['isError']) {
										$testObject.errors = result['store']['errors'];
										return;
									}
									finishModalOpen();
								}}
								class="px-12 py-4 mr-auto"
								titleClasses="md:text-h5"
								title={'Finish'}
							/>
						</div>
						<Dialog
							bind:open={finishModalOpen}
							{isSubmitting}
							isSuccessOpen={isSuccess}
							title="Finishing your test"
						>
							<Separator
								w={'80%'}
								h={'1px'}
								color={$applicationStates['darkMode']
									? 'var(--dark-text-white-20)'
									: 'var(--light-text-black-20)'}
							/>
							<p class="py-4 text-center text-body1">
								Your test named <span class="block font-semibold"
									>{$testObject['title']}</span
								><Space gap={20} /> with a description:
								<span class="block font-semibold"
									>{$testObject['description']}</span
								><br />
								<Separator
									w={'50%'}
									h={'1px'}
									color={$applicationStates['darkMode']
										? 'var(--dark-text-white-20)'
										: 'var(--light-text-black-20)'}
								/>
								should be
							</p>
							<div class="flex justify-center gap-3">
								<button
									type="button"
									disabled={isSubmitting}
									class="btn btn-outline text-light_secondary dark:text-dark_primary outline-light_primary dark:outline-dark_primary hover:text-light_primary dark:hover:text-dark_primary hover:bg-gray-200 dark:hover:bg-dark_light_grey"
									on:click={() =>
										checkTestOnClientAndServerAndPostTestToDB(
											false,
											testImageFile
										)}>Saved as draft</button
								>
								<button
									type="button"
									disabled={isSubmitting}
									class="btn bg-light_primary dark:bg-dark_primary text-light_whiter hover:bg-light_secondary dark:hover:bg-dark_primary_dark"
									on:click={() =>
										checkTestOnClientAndServerAndPostTestToDB(
											true,
											testImageFile
										)}>Published</button
								>
							</div>
						</Dialog></TestDetails
					>
				</div>
			{:else if activeTab === 'preview'}
				<div
					in:fly={{
						x: 300,
						duration: SECTION_TRANSITION_DURATION,
						delay: SECTION_TRANSITION_DURATION
					}}
					out:fly={{
						x: 300,
						duration: $navigating === null ? SECTION_TRANSITION_DURATION : 0
					}}
				>
					<div class="max-w-[650px]">
						{#if testType === 'REGULAR'}
							<h3 class="text-h4">Your test preview</h3>
							<Separator w="100%" h="1px" class="mb-4" />
							{#each $testObject['questions'] as _, index}
								<Input
									questionIndex={index}
									testObject={structuredClone(get(testObject))}
									showOrderNumber={false}
								/>
							{/each}
						{/if}
					</div>
				</div>{/if}
		</div>
	{/if}
</div>

<style>
	.templates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 250px));
		gap: 16px;
	}

	@container (max-width: 768px) {
		.templates-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 200px));
		}
	}

	@container (max-width: 420px) {
		.templates-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 150px));
		}
	}

	.done {
		color: var(--light-primary);
	}

	:global(.dark) .done {
		color: var(--dark-primary);
	}
</style>
