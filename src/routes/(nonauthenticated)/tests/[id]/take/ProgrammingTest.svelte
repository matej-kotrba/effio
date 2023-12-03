<script lang="ts">
	import type { Prisma, TestRecord } from '@prisma/client';
	import type { editor } from 'monaco-editor';
	import { onMount } from 'svelte';
	import { testObject } from '~stores/testObject';
	import { handwrite } from '~use/handwrite';
	import Hints from './Hints.svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Sandbox from '@nyariv/sandboxjs';

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

	const sandbox = new Sandbox();

	let codeEditorContainer: HTMLDivElement;
	let codeEditor: editor.IStandaloneCodeEditor;

	let selectedTestIndex: number = 0;
	let testsConsoleLogs: string[][] = [];

	function compileCode() {
		const code = codeEditor.getValue();

		const originalConsoleLog = console.log;
		for (const i in content.tests) {
			const item = content.tests[i];
			console.log = (...args: any[]) => {
				args.forEach((arg) => {
					if (typeof arg === 'object' || typeof arg === 'function') {
						testsConsoleLogs[i].push(JSON.stringify(arg));
					} else {
						testsConsoleLogs[i].push(arg);
					}
				});
			};
			try {
				const exec = sandbox.compile(code);
				const scriptResult = exec({ data: JSON.parse(item.input) }).run();
				const output = JSON.parse(item.output);
				console.log(scriptResult, output);
				if (scriptResult === output) {
					console.log('success');
				} else {
					console.log('fail');
				}
			} catch (e) {}
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
			value: `/* Please keep the shape of the code like templated, \nfunction name is up to you and can be changed at any time but \nit has to be returned like that "return solution(data)"\ndata - has all the values from test cases */\n\n// !!!IMPORTANT!!! Due to the compiler limitations inline "if" statements\n// do NOT work as expected, use {} or ; at the end of line\n\nfunction solution(data) {\n\treturn\n}\n\nreturn solution(data)`,
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
			<Separator w={'100%'} h="1px" />
			<Space gap={10} />
			<Hints hints={content.hints} />
		</div>
	</div>
	<div>
		<div
			bind:this={codeEditorContainer}
			class="w-full min-h-[400px] rounded-md overflow-hidden"
		/>
		<div class="flex gap-2 mt-4">
			<BasicButton title="Run" onClick={compileCode}>
				<iconify-icon icon="raphael:run" class="text-2xl" />
			</BasicButton>
			<BasicButton title="Submit" buttonAttributes={{ disabled: true }}>
				<iconify-icon icon="raphael:run" class="text-2xl" />
			</BasicButton>
		</div>
		<div class="mt-4">
			<span class="font-semibold text-h6">Tests</span>
			<Separator w={'100%'} h="1px" />
			<div class="grid grid-cols-6 mt-2">
				<div
					class="max-h-[300px] flex flex-col col-span-1 gap-1 overflow-y-auto"
				>
					{#each content['tests'] as { input, output }, index}
						<button
							type="button"
							class="w-full btn"
							on:click={() => (selectedTestIndex = index)}
						>
							{index + 1}. Input: {input}
						</button>
					{/each}
				</div>
				<div class="col-span-5 pl-2">
					<span class="font-semibold">{selectedTestIndex + 1}.</span>
					<div>
						<span>Input: </span><span class="font-semibold"
							>{content['tests'][selectedTestIndex].input}</span
						>
					</div>
					<div>
						<span>Output: </span><span class="font-semibold"
							>{content['tests'][selectedTestIndex].output}</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
