<script lang="ts">
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
	import ScrollToTop from '~components/buttons/ScrollToTop.svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { editor } from 'monaco-editor';
	import { browser } from '$app/environment';
	import { applicationStates } from '~stores/applicationStates';

	export let data;

	const testObject = getTestObject();

	let questionContainerRef: HTMLDivElement | null = null;

	let higlightedInputIndex: number | null = null;

	function retypedProgrammingTestContent(
		res: Awaited<typeof data.streaming.record>['record']
	) {
		if (!res) return null;
		return res.questionRecords[0].content as ProgrammingQuestion;
	}

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

	let monaco: typeof import('monaco-editor') | null;
	let codeEditorContainer: HTMLDivElement;
	let codeEditor: editor.IStandaloneCodeEditor;

	$: {
		if (codeEditorContainer && codeEditor) {
			codeEditorContainer.style.height = `${
				codeEditor.getScrollHeight() + 50
			}px`;
			codeEditor.layout();
		}
	}

	$: {
		if (codeEditor) {
			codeEditor.updateOptions({
				theme: $applicationStates.darkMode.isDarkMode ? 'vs-dark' : 'vs-light'
			});
		}
	}

	onMount(async () => {
		monaco = await import('monaco-editor');

		await Promise.all([
			import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
		]).then(([javaScriptWorker]) => {
			self.MonacoEnvironment = {
				getWorker(_, label) {
					return new javaScriptWorker.default();
				}
			};
		});
		codeEditor = monaco.editor.create(codeEditorContainer, {
			value: `/* Please keep the shape of the code like templated, \nfunction name is up to you and can be changed at any time but \nit has to be returned like that "return solution(data)"\ndata - has all the values from test cases */\n\n// !!!IMPORTANT!!! Due to the compiler limitations inline "if" statements\n// do NOT work as expected, use {} or ; at the end of line\n\nfunction solution(data) {\n\treturn;\n}\n\nreturn solution(data)`,
			language: 'javascript',
			theme: $applicationStates.darkMode.isDarkMode ? 'vs-dark' : 'vs-light',
			contextmenu: false,
			readOnly: true
		});

		codeEditor.onKeyUp(() => {
			codeCharacterCount = codeEditor.getValue().length;
		});

		window.addEventListener('resize', () => {
			codeEditor.layout();
		});
	});

	$: codeCharacterCount = codeEditor?.getValue().length;

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', () => codeEditor.layout());
		}
		codeEditor?.dispose();
	});
</script>

<ScrollToTop />
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
				//@ts-ignore
			](question['content'], question['question']['content']),
			question['question']['content'],
			question['content']
		);
	})}
	{#if res.record}
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

			{#if $testObject && questionData}
				<div class="mx-auto max-w-[750px]" bind:this={questionContainerRef}>
					<h3 class="font-semibold text-h4">{res.record.title}</h3>
					<p>{res.record.description}</p>
					<Space gap={40} />
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
		{:else if res.record.test.testGroup.type === 'PROGRAMMING'}
			{@const content = retypedProgrammingTestContent(res.record)}
			<div class="mx-auto max-w-[750px]">
				<div>
					<h3 class="font-semibold text-h4">
						{res.record.questionRecords[0].question.title}
					</h3>
					<p>{content?.description}</p>
				</div>
				<div>
					<div bind:this={codeEditorContainer} />
					<p>Used characters: {content?.code.length}</p>
				</div>
			</div>
		{/if}
	{/if}
{/await}
