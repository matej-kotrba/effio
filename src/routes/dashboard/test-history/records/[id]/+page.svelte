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

	export function checkMarkSystem(markSystem: Prisma.JsonValue) {
		if (markSystem === null || typeof markSystem !== 'object') return null;
		if (markSystem.map === undefined) return null;

		markSystem = markSystem as Array<unknown>;

		for (let i = 0; i < markSystem.length; i++) {
			let item = markSystem[i] as MarkSystemJSON['marks'][0];
		}

		// if (typeof markSystem === 'object') return markSystem;
		// const string = markSystem?.toString();
		// if (string === undefined) return undefined;
		// return JSON.parse(string) as MarkSystemJSON['marks'];
	}
</script>

<script lang="ts">
	import Back from '~components/navigation/Back.svelte';
	import Space from '~components/separators/Space.svelte';
	import {
		getMarkBasedOnPoints,
		questionContentFunctions
	} from '~helpers/test';
	import { page } from '$app/stores';

	export let data;
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
			](question['question']['content'], question['content']),
			question['content'],
			question['question']['content']
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
			{@const marks = checkMarkSystem(res.record['test']['markSystemJSON'])}
			{@const mark = marks
				? getMarkBasedOnPoints(marks, userPoints, maxPoints)
				: undefined}
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
				<table class="table">
					<!-- head -->
					<thead>
						<tr class="text-light_text_black dark:text-dark_text_white">
							<th class="font-medium text-center">Mark</th>
							<th class="font-medium text-center">Your Points</th>
							<th class="font-medium text-center">Max Points</th>
							<th class="font-medium text-center">Percentage</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							{#if mark !== undefined}
								<td class="font-semibold text-center">{mark.name}</td>
							{:else}
								<td class="font-semibold text-center">Unknown</td>
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
				<a
					href={$page.url + '/detail'}
					class="btn btn-outline dark:text-dark_text_white dark:outline-dark_text_white"
				>
					Details
				</a>
			</div>
		{/if}
	{/if}
{/await}
