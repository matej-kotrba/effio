<script lang="ts">
	import Input from '~components/testTaking/Input.svelte';
	import { testObject } from '~stores/testObject';
	import {
		checkTestClient,
		checkTestServerAndRecordIt,
		initializeTestToTestStore
	} from '~helpers/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import { fade } from 'svelte/transition';
	import type { TestVersion } from '@prisma/client';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import MarkSystem from '~components/testCreator/creatorUtils/MarkSystem.svelte';

	export let data;

	let isTakingTest = false;

	let isSubmitting = false;
	let submitError: string = '';

	let result: QuestionServerCheckResponse<QuestionContent>[] | null = null;

	let openDialog: () => void;

	// console.log(data.testContent);

	initializeTestToTestStore(data.testContent);

	// TODO: Create a check for the JSON so we make sure that the JSON is in correct format
	let markSystem: MarkSystemJSON['marks'] | null;
	if (data.testContent.testVersions[0].markSystemJSON) {
		markSystem = JSON.parse(
			data.testContent.testVersions[0].markSystemJSON?.toString()
		) as MarkSystemJSON['marks'];
	} else {
		markSystem = null;
	}

	// $: console.log($testObject);
</script>

{#if !isTakingTest}
	<div
		class="max-w-[1200px] mx-auto dark:bg-dark_light_grey p-3 rounded-md shadow-md"
	>
		<p class="mb-3">Test name:<br />{data.testContent.title}</p>
		<p class="mb-3">Test description:<br />{data.testContent.description}</p>
		<p class="flex items-center gap-1">
			Is the test marked?
			{#if markSystem}
				<iconify-icon icon="ic:round-check" class="text-3xl text-green-500" />
				<!-- <Collapsible position="center" title="Show marking">
					{#each markSystem as mark, index}
						{#if mark["name"] && mark["limit"]}
							{#if markSystem[index + 1] !== undefined}
								<p>{mark["name"]} -> {mark["limit"]}% - {markSystem[index + 1]["limit"]}%</p>
							{/if}
							{}
						{/if}
					{/each}
				</Collapsible> -->
			{:else}
				<iconify-icon icon="ic:round-close" class="text-3xl text-red-600" />
			{/if}
		</p>
	</div>
{:else}
	{#if result}
		<div class="sticky top-0 left-0 flex gap-2" in:fade>
			<a href="/community">
				<button class="btn">Back to community</button>
			</a>
			{#if data.session?.user}
				<a href="/dashboard">
					<button class="btn">Back to dashboard</button>
				</a>
			{/if}
		</div>
	{/if}
	<Dialog bind:open={openDialog}>
		<p class="text-center text-light_text_black dark:text-dark_text_white">
			You are about to submit the test, after that you want be able to change
			your answers, do you want to proceed?
		</p>
		<Space />
		<div class="flex justify-center gap-3">
			<button class="btn">Cancel</button>
			<button
				class="text-white btn btn-primary dark:bg-dark_primary dark:border-dark_primary hover:bg-light_secondary dark:hover:bg-dark_secondary"
				on:click={async () => {
					if (isSubmitting) return;
					// Reset errors
					for (let i in $testObject.questions) {
						$testObject.questions[i].errors.content = '';
					}

					// Check test on the client first for all inputs filled and so on...
					let clientCheck = checkTestClient($testObject);
					if (!clientCheck['success']) {
						$testObject = clientCheck['store'];
						return;
					}

					isSubmitting = true;

					// Then check the test on the server for the correct answers
					// console.log('TEST', $testObject);
					let res = await checkTestServerAndRecordIt($testObject);
					if (!res['success']) {
						submitError = res['error'] || 'Something went wrong';
					} else {
						submitError = '';
						console.log(res);
						if (!res['questionData']) return;
						result = res['questionData'];
						// ...
					}

					isSubmitting = false;
				}}>Submit</button
			>
		</div>
	</Dialog>
	{#if $testObject}
		<div class="mx-auto max-w-[650px]">
			<h2 class="font-thin text-h3">{data.testContent.title}</h2>
			<p class="text-light_text_black dark:text-dark_text_white_60">
				{data.testContent.description}
			</p>
			<Space gap={40} />
			{#each data.testContent.testVersions[0].questions as _, index}
				<Input
					questionIndex={index}
					class={`border-2 border-solid ${
						$testObject.questions[index].errors.content
							? ' border-error'
							: 'border-transparent'
					}`}
					resultFormat={result === null ? null : result[index]}
				/>
				<Space gap={10} />
				{#if $testObject.questions[index].errors.content}
					<p class="text-error dark:text-dark_error text-body2">
						{$testObject.questions[index].errors.content}
					</p>
				{/if}
			{/each}
			<Space gap={40} />
			<div class="flex items-center justify-between">
				{#if submitError}
					<p class="text-error dark:text-dark_error text-body2">
						{submitError}
					</p>
				{/if}
				{#if result === null}
					<BasicButton
						title={'Check'}
						onClick={async () => {
							if (openDialog) {
								openDialog();
							}
						}}
						isLoading={isSubmitting}
						class="ml-auto"
					/>
				{/if}
			</div>
		</div>
	{/if}
{/if}
