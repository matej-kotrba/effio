<script lang="ts">
	import type { Prisma, TestRecord } from '@prisma/client';
	import type { editor } from 'monaco-editor';
	import { onMount } from 'svelte';
	import { testObject } from '~stores/testObject';
	import { handwrite } from '~use/handwrite';
	import Hints from './Hints.svelte';
	import Space from '~components/separators/Space.svelte';

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

	$: content = $testObject.questions[0].content as ProgrammingQuestion;

	let monaco: typeof import('monaco-editor');

	let codeEditorContainer: HTMLDivElement;
	let codeEditor: editor.IStandaloneCodeEditor;

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
			value:
				'/* Please keep the shape of the code like templated, \nfunction name is up to you and can be changed at any time but \nit has to be returned like that `return solution()` */\n\nfunction solution() {\n\treturn\n}\n\nreturn solution()',
			language: 'javascript',
			theme: 'vs-dark'
		});

		window.addEventListener('resize', () => codeEditor.layout());
	});
</script>

<div class="grid grid-cols-2 gap-2">
	<div>
		<h2 class="font-semibold text-h3">{data.testContent.title}</h2>
		<p class="text-body1">{data.testContent.description}</p>
		<div class="p-4 mt-2 rounded-md bg-light_grey">
			<h3 class="font-semibold text-h4" use:handwrite>
				{data.testContent.testVersions[0].questions[0].title}
			</h3>
			<p use:handwrite>{content.description}</p>
			<Space gap={10} />
			<Hints hints={content.hints} />
		</div>
	</div>
	<div>
		<div bind:this={codeEditorContainer} class="w-full min-h-[400px]" />
	</div>
</div>
