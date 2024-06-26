<script lang="ts" context="module">
	import type { Prisma } from '@prisma/client';

	export function checkJSONQuestionData(
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

	// Recieves an array of marsk not the whole object
	export function checkMarkSystem(markSystem: Prisma.JsonValue) {
		if (markSystem === null || typeof markSystem !== 'object') return null;
		if (markSystem.map === undefined) return null;
		let markSystemTemp = markSystem as Array<unknown>;

		for (let i = 0; i < markSystemTemp.length; i++) {
			let item = markSystemTemp[i] as MarkSystemJSON['marks'][0];
			if (item.name === undefined) return null;
			if (item.limit === undefined) return null;
		}

		return markSystem as MarkSystemJSON['marks'];
	}

	export function isMarkSystemCorrect(
		markSystem: Prisma.JsonValue
	): markSystem is MarkSystemJSON['marks'] {
		return checkMarkSystem(markSystem) !== null;
	}
</script>

<script lang="ts">
	import Back from '~components/navigation/Back.svelte';
	import Space from '~components/separators/Space.svelte';
	import { getMarkBasedOnPoints } from '~helpers/test/test.js';
	import { questionContentFunctions } from '~helpers/test/questionFunctions';
	import { page } from '$app/stores';
	import MarkSystemDropdown from '~components/collapsibles/markSystem/markSystemDropdown.svelte';

	export let data;

	function retypeProgrammingContent(content: unknown) {
		if (!content) return null;
		return content as ProgrammingQuestion;
	}
</script>

<Back link={'/dashboard/test-history'} />
{#await data.streaming.record}
	<div class="flex justify-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:then res}
	{#if res.record === null}
		<div class="grid place-items-center">
			<h4 class="text-h4">
				<span class="text-h2">404</span> - This test record does not seem to exist
				😕.
			</h4>
			<a
				class="btn btn-outline dark:text-dark_text_white dark:outline-dark_text_white"
				href="/dashboard">Back to dashboard</a
			>
		</div>
	{/if}
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
		{@const takenAt = new Date(res.record.createdAt)}
		<div
			class="overflow-x-auto max-w-[700px] mx-auto dark:bg-dark_grey p-6 rounded-md"
		>
			<h3 class="font-semibold text-h5">{res.record.title}</h3>
			<span class="text-light_text_black_80 dark:text-dark_text_white_80"
				>Taken on {takenAt.getDate()}. {takenAt.getMonth() + 1}. {takenAt.getFullYear()}
				- {takenAt.getHours()}:{takenAt.getMinutes()}</span
			>
			<Space gap={10} />
			{#if res.record.test.testGroup.type === 'REGULAR'}
				{@const marks = checkMarkSystem(res.record['test']['markSystemJSON'])}
				{#if questionData !== undefined && questionData.some((item) => item === undefined) === false && marks !== undefined}
					{@const maxPoints = res.record['questionRecords'].reduce(
						(acc, item) => {
							return acc + item.question.points;
						},
						0
					)}
					{@const userPoints = res.record['questionRecords'].reduce(
						(acc, item) => {
							return acc + item.userPoints;
						},
						0
					)}
					{@const mark = marks
						? getMarkBasedOnPoints(marks, userPoints, maxPoints)
						: undefined}

					<table class="table">
						<!-- head -->
						<thead>
							<tr class="text-light_text_black dark:text-dark_text_white">
								{#if isMarkSystemCorrect(res.record.test.markSystemJSON)}
									<th class="font-medium text-center">Mark</th>
								{/if}
								<th class="font-medium text-center">Your Points</th>
								<th class="font-medium text-center">Max Points</th>
								<th class="font-medium text-center">Percentage</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								{#if mark !== undefined}
									<td class="font-semibold text-center">{mark.name}</td>
								{/if}
								<td class="font-semibold text-center">{userPoints}</td>
								<td class="font-semibold text-center">{maxPoints}</td>
								<td class="font-semibold text-center"
									>{((userPoints / maxPoints || 0) * 100).toFixed(2)}%</td
								>
							</tr>
						</tbody>
					</table>
					<Space gap={10} />
					{#if isMarkSystemCorrect(res.record.test.markSystemJSON)}
						<MarkSystemDropdown markSystem={res.record.test.markSystemJSON} />
					{/if}
					<a
						href={$page.url + '/detail'}
						class="mt-2 btn btn-outline dark:text-dark_text_white dark:outline-dark_text_white"
					>
						Details
					</a>
				{/if}
			{:else if res.record.test.testGroup.type === 'PROGRAMMING'}
				<p>
					Completed using {retypeProgrammingContent(
						res.record.questionRecords[0].content
					)?.code.length || 'unknown'} characters
				</p>
				<Space gap={10} />

				<a
					href={$page.url + '/detail'}
					class="mt-2 btn btn-outline dark:text-dark_text_white dark:outline-dark_text_white"
				>
					Details
				</a>
			{/if}
		</div>
	{/if}
{/await}
