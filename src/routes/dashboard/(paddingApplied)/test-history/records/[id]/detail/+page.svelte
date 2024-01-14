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
	} from '../+page.svelte';

	export let data;

	const testObject = getTestObject();

	let questionContainerRef: HTMLDivElement | null = null;

	let higlightedInputIndex: number | null = null;

	data.streaming.record.then((data) => {
		if (!data.record) {
			return;
		}

		initializeTestToTestStore(testObject, {
			id: data.record.id,
			title: data.record.title,
			description: data.record.description,
			createdAt: data.record.createdAt,
			updatedAt: data.record.updatedAt,
			ownerId: data.record.userId!,
			published: data.record.test.testGroup.published,
			isPublic: data.record.test.testGroup.isPublic,
			imageUrl: data.record.test.testGroup.imageUrl,
			type: data.record.test.testGroup.type,
			tags: data.record.test.testGroup.tags,
			randomQuestionOrder: data.record.test.testGroup.randomQuestionOrder,
			testVersions: [
				{
					...data.record.test,
					markSystemJSON: (checkMarkSystem(data.record.test.markSystemJSON) !==
					null
						? {
								marks: data.record.test
									.markSystemJSON as MarkSystemJSON['marks']
						  }
						: {}) satisfies MarkSystemJSON,
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
			](question['content'], question['question']['content']),
			question['question']['content'],
			question['content']
		);
	})}
	{#if res.record}
		{@const marks = checkMarkSystem(res.record['test']['markSystemJSON'])}
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
				mark={isMarkSystemCorrect(marks)
					? getMarkBasedOnPoints(marks, userPoints, maxPoints).name
					: undefined}
				bind:markedIndex={higlightedInputIndex}
			/>
		{/if}
		<DashboardTitle
			title={res.record.title}
			subtitle={res.record.description}
		/>

		{#if $testObject && questionData}
			<div class="mx-auto max-w-[650px]" bind:this={questionContainerRef}>
				{#each res.record['questionRecords'] as question, index}
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
	{/if}
{/await}
