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

	export function getMarkSystemMarksByJSON(markSystem: Prisma.JsonValue) {
		const string = markSystem?.toString();
		if (string === undefined) return undefined;
		return JSON.parse(string) as MarkSystemJSON['marks'];
	}
</script>

<script lang="ts">
	import Back from '~components/navigation/Back.svelte';
	import {
		getMarkBasedOnPoints,
		questionContentFunctions
	} from '~helpers/test';

	export let data;
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
		{@const marks = getMarkSystemMarksByJSON(
			res.record['test']['markSystemJSON']
		)}
		{#if questionData !== undefined && questionData.some((item) => item === undefined) === false && marks !== undefined}
			{@const maxPoints = res.record['questionRecords'].reduce((acc, item) => {
				return acc + item.question.points;
			}, 0)}
			{@const userPoints = res.record['questionRecords'].reduce((acc, item) => {
				return acc + item.userPoints;
			}, 0)}
			{@const marks = getMarkSystemMarksByJSON(
				res.record['test']['markSystemJSON']
			)}
			{@const mark = marks
				? getMarkBasedOnPoints(marks, userPoints, maxPoints)
				: undefined}
			<div class="overflow-x-auto">
				<table class="table">
					<!-- head -->
					<thead>
						<tr>
							<th>Mark</th>
							<th>Your Points</th>
							<th>Max Points</th>
							<th>Percentage</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							{#if mark !== undefined}
								<td>{mark.name}</td>
							{:else}
								<td>Unknown</td>
							{/if}
							<td>{userPoints}</td>
							<td>{maxPoints}</td>
							<td>{(userPoints / maxPoints || 0) * 100}%</td>
						</tr>
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
{/await}
