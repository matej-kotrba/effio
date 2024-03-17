<script lang="ts">
	import { getTestObject } from '~stores/testObject';
	import {
		checkTestClient,
		checkTestServerAndRecordIt,
		initializeTestToTestStore
	} from '~helpers/test/test';
	import Space from '~components/separators/Space.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import type { Prisma, TestRecord } from '@prisma/client';
	import RegularTest from './RegularTest.svelte';
	import NewProgrammingTest from './NewProgrammingTest.svelte';

	export let data;

	const testObject = getTestObject();

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

	initializeTestToTestStore(testObject, data.testContent);
</script>

<Dialog bind:open={openDialog}>
	<p class="text-center text-light_text_black dark:text-dark_text_white">
		You are about to submit the test, after that you <b>WONT</b> be able to change
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
			<RegularTest data={data.testContent} session={data.session} />
		</div>
	{:else if data.testContent.type === 'PROGRAMMING'}
		<div class="mx-auto max-w-[1400px]">
			<NewProgrammingTest
				questionIndex={0}
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
