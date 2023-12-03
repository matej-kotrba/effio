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
	import type { Prisma, TestRecord, TestRecordPayload } from '@prisma/client';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte';
	import RegularTest from './RegularTest.svelte';
	import ProgrammingTest from './ProgrammingTest.svelte';

	export let data;

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

	initializeTestToTestStore(data.testContent);
</script>

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
				// console.log('TEST', $testObject);
				let res = await checkTestServerAndRecordIt($testObject);
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
	{#if data.testContent.type === 'REGULAR'}
		<div class="mx-auto max-w-[650px]">
			<RegularTest
				{data}
				{isSubmitting}
				{submitError}
				{openDialog}
				{result}
				{returnedTestRecord}
			/>
		</div>
	{:else if data.testContent.type === 'PROGRAMMING'}
		<div class="mx-auto max-w-[1400px]">
			<ProgrammingTest
				{data}
				{isSubmitting}
				{submitError}
				{openDialog}
				{result}
				{returnedTestRecord}
			/>
		</div>
	{/if}
{:else}
	<div class="grid place-content-center">
		<p>Oops, something with this test is not correct</p>
		<a class="btn btn-outline" href="/community">Back to community place</a>
	</div>
{/if}
