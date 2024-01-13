<script lang="ts">
	import type { Prisma, TestRecord } from '@prisma/client';
	import type { editor } from 'monaco-editor';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getTestObject } from '~stores/testObject';
	import { handwrite } from '~use/handwrite';
	import Hints from './Hints.svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Sandbox from '@nyariv/sandboxjs';
	import { NONAUTHENTICATED_NAV_HEIGHT } from '~components/page-parts/Navbar.svelte';
	import { browser } from '$app/environment';
	import { Confetti } from 'svelte-confetti';
	import toast from 'svelte-french-toast';
	import { isEqual } from 'lodash';
	import { tweened } from 'svelte/motion';
	import { get } from 'svelte/store';
	import { circIn } from 'svelte/easing';

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

	let sandbox: Sandbox | undefined = undefined;
	$: {
		if (Sandbox?.prototype) {
			const oldConsoleLog = console.log;
			console.log = (...args: any[]) => {
				args.forEach((arg) => {
					if (typeof arg === 'object' || typeof arg === 'function') {
						testsConsoleLogs[testsConsoleLogs.length - 1].push(
							JSON.stringify(arg)
						);
					} else {
						testsConsoleLogs[testsConsoleLogs.length - 1].push(arg);
					}
				});
			};
			sandbox = new Sandbox();
			console.log = oldConsoleLog;
		}
	}

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

	canRunAgainDelay.subscribe((value) => {
		console.log(value);
	});

	async function compileCode() {
		if (get(canRunAgainDelay) > 0) return;
		if (!!result) return;
		if (!sandbox) return;
		const code = codeEditor.getValue();

		testsConsoleLogs = [];
		for (const i in content.tests) {
			const item = content.tests[i];
			testsConsoleLogs[i] = [];

			try {
				// sandbox.context.options.prototypeReplacements?.set(
				// 	console.log.prototype,
				// 	(args: any[]) => {
				// 		args.forEach((arg) => {
				// 			if (typeof arg === 'object' || typeof arg === 'function') {
				// 				testsConsoleLogs[i].push(JSON.stringify(arg));
				// 			} else {
				// 				testsConsoleLogs[i].push(arg);
				// 			}
				// 		});
				// 	}
				// );

				const exec = sandbox.compile(code);
				const scriptResult = exec({ data: JSON.parse(item.input) }).run();
				const output = JSON.parse(item.output);
				if (isEqual(scriptResult, output)) {
					testsInfo[i] = {
						result: JSON.stringify(scriptResult),
						passed: true
					};
				} else {
					testsInfo[i] = {
						result: JSON.stringify(scriptResult),
						passed: false
					};
				}
			} catch (e) {
				console.log(e);
			}
		}

		if (testsInfo.every((test) => test.passed)) {
			activateConfetti = false;
			toast.success('You got it!\nAll tests are passing.');
			await tick();
			activateConfetti = true;
		}

		// Disabling the run button for a while
		canRunAgainDelay.set(CAN_RUN_AGAIN_DELAY_DURATION, { duration: 0 });
		canRunAgainDelay.set(0);
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

{#if browser}
	{#if activateConfetti}
		<div
			style="position: fixed; top: -50px; left: 0; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden;"
		>
			{#each Array(2) as _, index}
				<Confetti
					x={[-5, 5]}
					y={[0, 0.1]}
					delay={[100 + index * 2000, 2000 + index * 2000]}
					duration={3000}
					amount={300}
					fallDistance="100vh"
				/>
			{/each}
		</div>
	{/if}
{/if}

<div class="@container">
	<div
		class="relative flex flex-col grid-cols-2 gap-2 @4xl:grid !max-h-fit @4xl:max-h-[auto] !h-fit @4xl:h-[auto]"
		style={`max-height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - 100px); height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px);`}
	>
		<div
			class="!max-h-fit @4xl:max-h-[auto] !h-fit @4xl:h-[auto]"
			style={`max-height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - 100px); height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px);`}
		>
			<h2 class="font-semibold text-h3">{data.testContent.title}</h2>
			<p class="text-body1">{data.testContent.description}</p>
			<div class="p-4 mt-2 rounded-md bg-light_grey dark:bg-dark_grey">
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
		<div
			style={`max-height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - 100px); height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px); grid-template-rows: auto 1fr;`}
			class="relative grid !max-h-fit @4xl:max-h-[auto] !h-fit @4xl:h-[auto]"
		>
			<div class="text-right">{codeCharacterCount} characters</div>
			<div class="relative w-full max-w-full h-fit">
				<!-- Placeholder for loading editor -->
				<div class="relative min-h-[400px] h-fit max-w-full w-full">
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
						class="max-w-full min-h-[400px] overflow-hidden rounded-md"
					/>
				</div>
				<div class="flex gap-2 mt-4">
					<div
						class="relative run-button"
						style={`--cover-percentage: ${
							($canRunAgainDelay / CAN_RUN_AGAIN_DELAY_DURATION) * 100
						}%;`}
					>
						<BasicButton
							title="Run"
							onClick={compileCode}
							buttonAttributes={{ disabled: $canRunAgainDelay > 0 || !!result }}
						>
							<iconify-icon icon="raphael:run" class="text-2xl" />
						</BasicButton>
					</div>
					<BasicButton
						title="Submit"
						onClick={submitTest}
						buttonAttributes={{
							disabled:
								!!result || testsInfo.length === 0
									? true
									: testsInfo.some((test) => test.passed === false)
						}}
					>
						<iconify-icon icon="raphael:run" class="text-2xl" />
					</BasicButton>
				</div>
			</div>

			<div class="relative h-full max-h-full">
				<span class="font-semibold text-h6">Tests</span>
				<Separator w={'100%'} h="1px" />
				<div class="grid grid-cols-6 mt-2 @container h-full max-h-full">
					<div
						class="max-h-[300px] flex flex-col @2xl:col-span-2 @6xl:col-span-1 gap-1 overflow-y-auto"
					>
						{#each content['tests'] as { input, output }, index}
							<button
								type="button"
								class="w-full btn dark:bg-dark_light_grey dark:border-dark_light_grey dark:text-dark_text_white"
								on:click={() => (selectedTestIndex = index)}
							>
								{index + 1}. {input}
							</button>
						{/each}
					</div>
					<div
						class="grid grid-cols-5 col-span-4 @6xl:col-span-5 gap-2 pl-2 max-h-full h-full"
					>
						<div class="col-span-3">
							<span class="font-semibold">{selectedTestIndex + 1}.</span>
							<div>
								<span>Input: </span><span class="font-semibold"
									>{content['tests'][selectedTestIndex].input}</span
								>
							</div>
							<div>
								<span>Output: </span><span class={`font-semibold`}
									>{testsInfo[selectedTestIndex]
										? testsInfo[selectedTestIndex].result
										: ''}</span
								>
							</div>
							<div>
								<span>Result: </span><span
									class={`font-semibold ${
										testsInfo[selectedTestIndex] &&
										testsInfo[selectedTestIndex].passed
											? 'text-success'
											: 'text-error dark:text-dark_error'
									}`}
									>{testsInfo[selectedTestIndex]
										? testsInfo[selectedTestIndex].passed
											? 'Passed'
											: 'Failed'
										: ''}</span
								>
							</div>
							<div>
								<span>Expected Output: </span><span class="font-semibold"
									>{content['tests'][selectedTestIndex].output}</span
								>
							</div>
						</div>
						<div
							class="relative grid col-span-2 gap-1"
							style="grid-template-rows: auto 1fr;"
						>
							<div>
								<span>Logs</span>
								<Separator w="100%" h="1px" />
							</div>
							<!-- Temporary solution, CSS won't be able to work with dynamic values well here -->
							<div class="flex flex-col h-[200px] overflow-y-auto">
								{#if testsConsoleLogs[selectedTestIndex]}
									{#each testsConsoleLogs[selectedTestIndex] as log}
										<span class="text-xs">{log}</span>
									{/each}
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.run-button::after {
		content: '';
		inset: 0;
		background-color: var(--light-grey);
		border-radius: 6px;
		position: absolute;
		pointer-events: none;
		opacity: 1;
		mask-image: linear-gradient(
			to top,
			white calc(var(--cover-percentage)),
			transparent calc(var(--cover-percentage))
		);
	}

	:global(.dark) .run-button::after {
		background-color: var(--dark_light_grey);
	}
</style>
