<script lang="ts">
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import {
		initializeTestToTestStore,
		questionContentFunctions
	} from '~helpers/test.js';
	import { testObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';
	import Input from '~components/testTaking/Input.svelte';
	import Back from '~components/navigation/Back.svelte';
	import TestTakingNavigation from '~components/page-parts/TestTakingNavigation.svelte';

	export let data;

	let questionContainerRef: HTMLDivElement | null = null;

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
</script>

<Back link={'/dashboard/test-history'} />
{#await data.streaming.record}
	<div class="flex justify-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:then res}
	{@const questionData = res.record?.questionRecords.map((question) => {
		return {
			// @ts-ignore
			isCorrect: questionContentFunctions[question['question']['type']['slug']][
				'checkAnswerCorrectness'
			](question['question']['content'], question['content']),
			userAnswer: question['content'],
			correctAnswer: question['question']['content']
		};
	})}
	{#if res.record}
		<TestTakingNavigation
			session={data.session}
			{questionContainerRef}
			result={questionData}
		/>
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
					/>
					<Space gap={20} />
				{/each}
			</div>
		{/if}
	{/if}
{/await}
