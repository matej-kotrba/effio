<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import {
		getMarkBasedOnPoints,
		initializeTestToTestStore
	} from '~helpers/test/test.js';
	import { questionContentFunctions } from '~helpers/test/questionFunctions';
	import { getTestObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';
	import Input from '~components/testTaking/Input.svelte';
	import Back from '~components/navigation/Back.svelte';
	import TestTakingNavigation from '~components/page-parts/TestTakingNavigation.svelte';
	import {
		checkJSONQuestionData,
		checkMarkSystem,
		isMarkSystemCorrect
	} from '~/routes/dashboard/(paddingApplied)/test-history/records/[testId]/+page.svelte';
	import { goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import { page } from '$app/stores';

	export let data;

	const testObject = getTestObject();

	let questionContainerRef: HTMLDivElement | null = null;

	let higlightedInputIndex: number | null = null;

	const user = data.group.users.find(
		(user) => user.userId === $page.params.userId
	)?.user;

	let testVersion: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		version: number;
		testId: string;
		markSystemJSON: Prisma.JsonValue;
		totalPoints: number;
	} | null = null;

	data.streamingTestRecord.testRecord.then((record) => {
		if (!record) {
			return;
		}

		testVersion =
			data.test.testVersions.find((version) => version.id === record.testId) ||
			null;

		if (!testVersion) {
			return;
		}

		initializeTestToTestStore(testObject, {
			id: record.id,
			title: record.title,
			description: record.description,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
			ownerId: record.userId!,
			published: data.test.published,
			isPublic: data.test.isPublic,
			imageUrl: data.test.imageUrl,
			type: data.test.type,
			tags: data.test.tags,
			randomQuestionOrder: data.test.randomQuestionOrder,
			testVersions: [
				{
					...testVersion,
					markSystemJSON: (checkMarkSystem(testVersion.markSystemJSON) !== null
						? {
								marks: testVersion.markSystemJSON as MarkSystemJSON['marks']
						  }
						: {}) satisfies MarkSystemJSON,
					questions: record.questionRecords.map((item) => {
						return {
							...item.question,
							content: item.content
						};
					})
				}
			]
		});
	});
</script>

<Back link={'/dashboard/test-history'} />
{#await data.streamingTestRecord.testRecord}
	<div class="flex justify-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:then res}
	{#if res && testVersion}
		{@const questionData = res.questionRecords.map((question) => {
			return checkJSONQuestionData(
				// @ts-ignore
				questionContentFunctions[question['question']['type']['slug']][
					'checkAnswerCorrectness'
					//@ts-ignore
				](question['content'], question['question']['content']),
				question['question']['content'],
				question['content']
			);
		})}
		{@const marks = checkMarkSystem(testVersion['markSystemJSON'])}
		{#if questionData !== undefined && questionData.some((item) => item === undefined) === false && marks !== undefined}
			<TestTakingNavigation
				premarkText="{user?.name || 'User'}'s mark is: "
				session={data.session}
				{questionContainerRef}
				result={questionData}
				maxPoints={testVersion.totalPoints}
				userPoints={res.userPoints}
				mark={isMarkSystemCorrect(marks)
					? getMarkBasedOnPoints(marks, res.userPoints, testVersion.totalPoints)
							.name
					: undefined}
				bind:markedIndex={higlightedInputIndex}
			/>
		{/if}
		<DashboardTitle title={res.title} subtitle={res.description} />

		{#if $testObject && questionData}
			<div class="mx-auto max-w-[650px]" bind:this={questionContainerRef}>
				{#each res['questionRecords'] as question, index}
					<Input
						testObject={$testObject}
						questionIndex={index}
						class={`border-2 border-solid ${
							$testObject.questions[index].errors.content
								? ' border-error'
								: 'border-transparent'
						}`}
						resultFormat={questionData[index]}
						isHighlighted={index === higlightedInputIndex}
						points={question.question.points
							? {
									got: question.userPoints,
									max: question.question.points
							  }
							: undefined}
					/>
					<Space gap={20} />
				{/each}
			</div>
		{/if}
	{:else}
		<div class="grid place-content-center">
			<span>This record does not seem to exist</span>
			<a
				href={$page.url.pathname.split('/').slice(0, -2).join('/')}
				class="btn btn-outline dark:text-white dark:border-white"
				>Back to user's tests</a
			>
		</div>
	{/if}
{/await}
