<script lang="ts">
	import type { Prisma, TestRecord } from '@prisma/client';
	import type { editor } from 'monaco-editor';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getTestObject } from '~stores/testObject';
	import { browser } from '$app/environment';
	import toast from 'svelte-french-toast';
	import { tweened } from 'svelte/motion';
	import { get } from 'svelte/store';
	import { circIn } from 'svelte/easing';
	import Worker from './sandbox-worker?worker';
	import { NONAUTHENTICATED_NAV_HEIGHT } from '~components/page-parts/Navbar.svelte';
	import * as Resizable from '~components/ui/resizable';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Hints from './Hints.svelte';
	import { handwrite } from '~use/handwrite';

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

	export let questionIndex: number;

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

	const testObject = getTestObject();

	$: content = $testObject.questions[0].content as ProgrammingQuestion;

	$: {
		if (codeEditor) {
			if (result) {
				codeEditor.updateOptions({
					readOnly: true
				});
			}
		}
	}

	let monaco: typeof import('monaco-editor');

	let testsConsoleLogs: string[][] = [];

	let worker: Worker;

	let codeEditorContainer: HTMLDivElement;
	let codeEditor: editor.IStandaloneCodeEditor;

	let selectedTestIndex: number = 0;
	let testsInfo: { result: string; passed: boolean }[] = [];

	let activateConfetti: boolean = false;

	const CAN_RUN_AGAIN_DELAY_DURATION = 3000;

	let canRunAgainDelay = tweened(0, {
		duration: CAN_RUN_AGAIN_DELAY_DURATION,
		easing: circIn
	});

	let isProccessing = false;

	async function compileCode() {
		if (get(canRunAgainDelay) > 0) return;
		if (!!result) return;
		// if (!sandbox) return;
		const code = codeEditor.getValue();

		isProccessing = true;
		worker.postMessage({
			code: code,
			tests: content.tests
		});

		setTimeout(async () => {
			if (isProccessing === true) {
				isProccessing = false;
				toast.error('Your ran into a problem');
				if (worker && Worker) {
					console.log('Reinitialized worker');
					worker.terminate();
					worker = new Worker();
					worker.addEventListener('message', onWorkerMessage);
				}
			}
		}, 1000);
		testsConsoleLogs = [];

		// Disabling the run button for a while
		canRunAgainDelay.set(CAN_RUN_AGAIN_DELAY_DURATION, { duration: 0 });
		canRunAgainDelay.set(0);
	}

	async function onWorkerMessage(
		e: MessageEvent<{
			passed: boolean;
			result: string;
			logs: string[];
			index: number;
		}>
	) {
		isProccessing = false;
		testsConsoleLogs[e.data.index] = e.data.logs;
		testsInfo[e.data.index] = {
			passed: e.data.passed,
			result: e.data.result
		};

		if (testsInfo.every((test) => test.passed)) {
			activateConfetti = false;
			toast.success('You got it!\nAll tests are passing.');
			await tick();
			activateConfetti = true;
		}
	}

	async function submitTest() {
		if (!!result) return;
		const doTestsPass =
			testsInfo.length === 0
				? false
				: !testsInfo.some((test) => test.passed === false);
		if (!doTestsPass) return;
		if (!$testObject.questions[questionIndex]) return;

		const code = codeEditor.getValue();
		($testObject.questions[questionIndex].content as ProgrammingQuestion).code =
			code;
		openDialog();
	}

	function repaintEditor() {
		console.log('asdasd');
		codeEditor.layout();
	}

	onMount(async () => {
		monaco = await import('monaco-editor');

		worker = new Worker();
		worker.addEventListener('message', onWorkerMessage);

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
			theme: 'vs-dark',
			contextmenu: false
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

<div
	class="relative"
	style={`max-height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - 100px); height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px);`}
>
	<Resizable.PaneGroup
		direction="horizontal"
		class="h-full border rounded-lg border-light_text_black_60"
	>
		<Resizable.Pane defaultSize={50}>
			<div class="flex flex-col justify-between h-full p-2">
				<!-- Upper part -->
				<div>
					<div class="">
						<h3 class="font-semibold text-h4" use:handwrite>
							{data.testContent.testVersions[0].questions[0].title}
						</h3>
						<p use:handwrite>{content.description}</p>
						<Space gap={10} />
						<Separator w={'100%'} h="1px" />
						<Space gap={10} />
						<Hints hints={content.hints} />
					</div>
					{#if result}
						<Space gap={20} />
						<div>
							<span class="text-body1"
								>You have made it using <b>{content.code.length}</b> characters</span
							>
						</div>
						<div class="flex gap-1">
							<a
								href="/dashboard"
								class="btn btn-outline dark:outline-dark_text_white dark:text-dark_text_white dark:hover:bg-dark_text_white_10 dark:hover:border-dark_text_white"
								>To dashboard</a
							>
							<a
								href="/community"
								class="btn btn-outline dark:outline-dark_text_white dark:text-dark_text_white dark:hover:bg-dark_text_white_10 dark:hover:border-dark_text_white"
								>To community</a
							>
						</div>
					{/if}
				</div>

				<!-- Lower part -->
				<div class="mr-auto text-right">
					<span class="font-semibold text-h6">{codeCharacterCount}</span>
					<span>used characters</span>
				</div>
			</div>
		</Resizable.Pane>
		<Resizable.Handle
			on:resizedContainer={repaintEditor}
			class="bg-light_text_black_60"
		/>
		<Resizable.Pane defaultSize={50}>
			<Resizable.PaneGroup direction="vertical">
				<Resizable.Pane defaultSize={50}>
					<div class="relative w-full h-full max-w-full">
						{#if !codeEditor}
							<div
								class="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
							>
								<span class="font-semibold">Loading the editor ...</span>
								<span class="loading loading-bars loading-lg" />
							</div>
						{/if}
						<div
							bind:this={codeEditorContainer}
							class="h-full max-w-full overflow-hidden rounded-md"
						/>
					</div>
				</Resizable.Pane>
				<Resizable.Handle
					on:resizedContainer={repaintEditor}
					class="bg-light_text_black_60"
				/>
				<Resizable.Pane defaultSize={50}>
					<div class="flex items-center justify-center h-full p-6">
						<span class="font-semibold">Three</span>
					</div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
