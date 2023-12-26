<script lang="ts">
	import { page } from '$app/stores';
	import type { Prisma, TestRecord } from '@prisma/client';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import TestTakingNavigation from '~components/page-parts/TestTakingNavigation.svelte';
	import Space from '~components/separators/Space.svelte';
	import Input from '~components/testTaking/Input.svelte';
	import { getMarkBasedOnPoints } from '~helpers/test/test';
	import { testObject } from '~stores/testObject';

	export let data: {
		testContent: Prisma.TestGetPayload<{
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
	};
	export let submitError: string;
	export let isSubmitting: boolean;
	export let openDialog: () => void;
	export let result: QuestionServerCheckResponse<QuestionContent>[] | null;
	export let returnedTestRecord:
		| (TestRecord &
				Prisma.TestRecordGetPayload<{
					include: {
						questionRecords: true;
					};
				}>)
		| undefined = undefined;

	// TODO: Create a check for the JSON so we make sure that the JSON is in correct format
	let markSystem: MarkSystemJSON['marks'] | null = checkMarkSystem(
		data.testContent.testVersions[0].markSystemJSON
	);

	let questionContainerRef: HTMLDivElement | null = null;

	let higlightedInputIndex: number | null = null;
</script>

{#if result && returnedTestRecord}
	{@const maxPoints = data.testContent.testVersions[0].questions.reduce(
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
		session={$page['data'].session}
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
<h2 class="font-thin text-h3">{data.testContent.title}</h2>
<p class="text-light_text_black dark:text-dark_text_white_60">
	{data.testContent.description}
</p>
<Space gap={40} />
<div bind:this={questionContainerRef}>
	{#each data.testContent.testVersions[0].questions as _, index}
		<Input
			testObject={$testObject}
			questionIndex={index}
			class={`border-2 border-solid ${
				$testObject.questions[index].errors.content
					? ' border-error'
					: 'border-transparent'
			}`}
			resultFormat={result === null ? null : result[index]}
			points={returnedTestRecord
				? {
						got: returnedTestRecord?.questionRecords[index].userPoints,
						max: data.testContent.testVersions[0].questions[index].points
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
