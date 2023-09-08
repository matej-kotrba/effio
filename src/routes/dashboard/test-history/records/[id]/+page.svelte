<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import {
		getMarkBasedOnPoints,
		initializeTestToTestStore,
		questionContentFunctions
	} from '~helpers/test.js';
	import { testObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';
	import Input from '~components/testTaking/Input.svelte';
	import Back from '~components/navigation/Back.svelte';
	import TestTakingNavigation from '~components/page-parts/TestTakingNavigation.svelte';
	import type { Prisma } from '@prisma/client';

	export let data;

	let questionContainerRef: HTMLDivElement | null = null;

	let higlightedInputIndex: number | null = null;

	data.streaming.record.then((data) => {
		if (!data.record) {
			return;
		}

		initializeTestToTestStore({
			id: data.record.id,
			title: data.record.title,
			description: data.record.description,
			createdAt: data.record.createdAt,
			updatedAt: data.record.updatedAt,
			ownerId: data.record.userId,
			published: data.record.test.testGroup.published,
			testVersions: [
				{
					...data.record.test,
					questions: data.record.questionRecords.map((item) => {
						return {
							...item.question,
							content: item.content
						};
					})
				}
			]

			// ...data.record.test,
			// questions: data.record.questionRecords.map((item) => item.content)
		});
	});

	function checkJSONQuestionData(
		isCorrect: unknown,
		correctAnswer: Prisma.JsonValue,
		userAnswer: Prisma.JsonValue
	) {
		return {
			isCorrect: isCorrect as boolean,
			userAnswer:
				userAnswer as QuestionServerCheckResponse<QuestionContent>['userAnswer'],
			correctAnswer:
				correctAnswer as QuestionServerCheckResponse<QuestionContent>['correctAnswer']
		};
	}

	function getMarkSystemMarks(markSystem: Prisma.JsonValue) {
		const string = markSystem?.toString();
		if (string === undefined) return undefined;
		return JSON.parse(string) as MarkSystemJSON['marks'];
	}
</script>

<Back link={'/dashboard/test-history'} />
{#await data.streaming.record}
	<div class="flex justify-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:then res}
	{@const questionData = res.record?.questionRecords.map((question) => {
		return checkJSONQuestionData(
			// @ts-ignore
			questionContentFunctions[question['question']['type']['slug']][
				'checkAnswerCorrectness'
			](question['question']['content'], question['content']),
			question['content'],
			question['question']['content']
		);
	})}
	{#if res.record}
		{@const marks = getMarkSystemMarks(res.record['test']['markSystemJSON'])}
		{#if questionData !== undefined && questionData.some((item) => item === undefined) === false && marks !== undefined}
			{@const maxPoints = res.record['questionRecords'].reduce((acc, item) => {
				return acc + item.question.points;
			}, 0)}
			{@const userPoints = res.record['questionRecords'].reduce((acc, item) => {
				return acc + item.userPoints;
			}, 0)}
			<TestTakingNavigation
				session={data.session}
				{questionContainerRef}
				result={questionData}
				{maxPoints}
				{userPoints}
				mark={getMarkBasedOnPoints(marks, userPoints, maxPoints).name}
				bind:markedIndex={higlightedInputIndex}
			/>
		{/if}
		<DashboardTitle
			title={res.record.title}
			subtitle={res.record.description}
		/>

		{#if $testObject}
			<div class="mx-auto max-w-[650px]" bind:this={questionContainerRef}>
				{#each res.record['questionRecords'] as question, index}
					<Input
						questionIndex={index}
						class={`border-2 border-solid ${
							$testObject.questions[index].errors.content
								? ' border-error'
								: 'border-transparent'
						}`}
						resultFormat={{
							// @ts-ignore
							isCorrect: questionContentFunctions[
								question['question']['type']['slug']
							]['checkAnswerCorrectness'](
								question['question']['content'],
								question['content']
							),
							// @ts-ignore
							correctAnswer: question['question']['content'],
							// @ts-ignore
							userAnswer: question['content']
						}}
						isHighlighted={index === higlightedInputIndex}
					/>
					<Space gap={20} />
				{/each}
			</div>
		{/if}
	{/if}
{/await}
