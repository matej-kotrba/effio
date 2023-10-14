<script lang="ts">
	import Input from '~components/testTaking/Input.svelte';
	import { testObject } from '~stores/testObject';
	import {
		checkTestClient,
		checkTestServerAndRecordIt,
		getMarkBasedOnPoints,
		initializeTestToTestStore
	} from '~helpers/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import TestTakingNavigation from '~components/page-parts/TestTakingNavigation.svelte';
	import type { Prisma, TestRecord } from '@prisma/client';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte';
	import type { Session } from '@auth/core/types';

	export let testContent: Prisma.TestGetPayload<{
		include: {
			testVersions: {
				include: {
					questions: {
						include: {
							type: true;
						};
					};
				};
			};
			owner: true;
		};
	}>;
	export let session: Session | null;
	export let subcategoryId: string | undefined = undefined;

	let isSubmitting = false;
	let submitError: string = '';

	let result: QuestionServerCheckResponse<QuestionContent>[] | null = null;
	let returnedTestRecord:
		| (TestRecord &
				Prisma.TestRecordGetPayload<{
					include: {
						questionRecords: true;
					};
				}>)
		| undefined = undefined;

	let openDialog: () => void;

	initializeTestToTestStore(testContent);

	let markSystem: MarkSystemJSON['marks'] | null = checkMarkSystem(
		testContent.testVersions[0].markSystemJSON
	);

	let questionContainerRef: HTMLDivElement | null = null;

	let higlightedInputIndex: number | null = null;
</script>

{#if result && returnedTestRecord}
	{@const maxPoints = testContent.testVersions[0].questions.reduce(
		(acc, item) => acc + item.points,
		0
	)}
	{@const userPoints =
		returnedTestRecord?.questionRecords.reduce((count, item) => {
			if (item['userPoints']) {
				return count + item['userPoints'];
			} else {
				return count;
			}
		}, 0) || 0}
	<TestTakingNavigation
		{session}
		{questionContainerRef}
		{result}
		bind:markedIndex={higlightedInputIndex}
		{maxPoints}
		{userPoints}
		mark={markSystem
			? getMarkBasedOnPoints(markSystem, userPoints, maxPoints).name
			: undefined}
	/>
{/if}
<Dialog bind:open={openDialog}>
	<p class="text-center text-light_text_black dark:text-dark_text_white">
		You are about to submit the test, after that you want be able to change your
		answers, do you want to proceed?
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
				let res = await checkTestServerAndRecordIt($testObject, subcategoryId);
				if (!res['success']) {
					submitError = res['error'] || 'Something went wrong';
				} else {
					submitError = '';
					if (!res['questionData']) return;
					result = res['questionData'];
					returnedTestRecord = res['test'];
					// ...
				}

				isSubmitting = false;
			}}>Submit</button
		>
	</div>
</Dialog>
{#if $testObject}
	<div class="mx-auto max-w-[650px]">
		<h2 class="font-thin text-h3">{testContent.title}</h2>
		<p class="text-light_text_black dark:text-dark_text_white_60">
			{testContent.description}
		</p>
		<Space gap={40} />
		<div bind:this={questionContainerRef}>
			{#each testContent.testVersions[0].questions as _, index}
				<Input
					questionIndex={index}
					class={`border-2 border-solid ${
						$testObject.questions[index].errors.content
							? ' border-error'
							: 'border-transparent'
					}`}
					resultFormat={result === null ? null : result[index]}
					points={returnedTestRecord && markSystem
						? {
								got: returnedTestRecord?.questionRecords[index].userPoints,
								max: testContent.testVersions[0].questions[index].points
						  }
						: undefined}
				/>
				<Space gap={10} />
				{#if $testObject.questions[index].errors.content}
					<p class="text-error dark:text-dark_error text-body2">
						{$testObject.questions[index].errors.content}
					</p>
				{/if}
			{/each}
		</div>
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
<div class="h-[1200px]" />
