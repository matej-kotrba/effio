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

	export let data;

	data.streaming.record.then((data) => {
		if (!data.record) {
			return;
		}

		initializeTestToTestStore({
			id: data.record.id,
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
{:then data}
	{#if data.record}
		<DashboardTitle
			title={data.record.test.title}
			subtitle={data.record.test.description}
		/>

		{#if $testObject}
			<div class="mx-auto max-w-[650px]">
				{#each data.record['questionRecords'] as question, index}
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
