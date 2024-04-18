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
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Confetti from 'svelte-confetti';

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

	// export let submitError: string;
	// export let isSubmitting: boolean;
	export let openDialog: () => void;
	export let result: QuestionServerCheckResponse<QuestionContent>[] | null;
	// export let returnedTestRecord:
	// 	| (TestRecord &
	// 			Prisma.TestRecordGetPayload<{
	// 				include: {
	// 					questionRecords: true;
	// 				};
	// 			}>)
	// 	| undefined = undefined;

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
	let testsInfo: { result: string; passed: boolean }[] = new Array(
		($testObject.questions[0].content as ProgrammingQuestion).tests.length
	).fill({ result: '', passed: false });

	let testsCheckedCount = 0;
	let activateConfetti: boolean = false;

	const CAN_RUN_AGAIN_DELAY_DURATION = 3000;

	let canRunAgainDelay = tweened(0, {
		duration: CAN_RUN_AGAIN_DELAY_DURATION,
		easing: circIn
	});

	let isProccessing = false;

	async function compileCode() {
		testsCheckedCount = 0;
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
		}, 2000);
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

		testsCheckedCount++;
		if (
			testsCheckedCount === testsInfo.length &&
			testsInfo.every((test) => test.passed)
		) {
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
		if (worker) {
			try {
				worker.removeEventListener('message', onWorkerMessage);
				worker.terminate();
			} catch (e) {}
		}
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

<div
	class="relative"
	style={`max-height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - 100px); height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px);`}
>
	<Resizable.PaneGroup
		direction="horizontal"
		class="h-full border rounded-lg border-light_text_black_60"
	>
		<Resizable.Pane defaultSize={33}>
			<div class="flex flex-col justify-between h-full p-2">
				<!-- Upper part -->
				<div>
					<div class="">
						<h3 class="font-semibold text-h4" use:handwrite>
							{data.testContent.testVersions[0].questions[0].title}
						</h3>
						<p use:handwrite>{content.description}</p>
						<Space gap={10} />
						<Separator
							w={'100%'}
							h="1px"
							class="bg-light_text_black_60 dark:bg-dark_text_white_60"
						/>
						<Space gap={10} />
						<Hints hints={content.hints} />
						<Space gap={10} />
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
					<div class="flex gap-1">
						<div
							class="relative run-button"
							style={`--cover-percentage: ${
								($canRunAgainDelay / CAN_RUN_AGAIN_DELAY_DURATION) * 100
							}%;`}
						>
							<BasicButton
								title="Run"
								onClick={compileCode}
								buttonAttributes={{
									disabled: $canRunAgainDelay > 0 || !!result
								}}
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
						/>
					</div>
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
		<Resizable.Pane defaultSize={67}>
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
							class="h-full max-w-full overflow-hidden"
						/>
					</div>
				</Resizable.Pane>
				<Resizable.Handle
					on:resizedContainer={repaintEditor}
					class="bg-light_text_black_60"
				/>
				<Resizable.Pane defaultSize={50}>
					<div class="relative h-full max-h-full p-2 overflow-hidden">
						<div
							class="relative mt-2 @container h-full max-h-full overflow-y-auto"
						>
							<div
								class="sticky top-0 z-10 flex gap-1 overflow-x-auto flex-nowrap bg-light_white dark:bg-dark_black"
							>
								{#each content['tests'] as _, index}
									<button
										type="button"
										style="--pin-color: {testsInfo[index]
											? testsInfo[index].passed
												? 'var(--success)'
												: 'var(--error)'
											: 'var(--warning)'}"
										class={`relative px-8 btn dark:bg-dark_light_grey dark:border-dark_light_grey dark:text-dark_text_white overflow-hidden
											after:content-[''] after:w-full after:h-1 after:left-0 after:top-0 after:absolute after:bg-[var(--pin-color)]
											dark:hover:bg-dark_grey ${
												selectedTestIndex === index
													? 'dark:!bg-dark_secondary !bg-light_terciary text-white'
													: ''
											}`}
										on:click={() => (selectedTestIndex = index)}
									>
										{index + 1}
									</button>
								{/each}
							</div>

							<div class="@container/inner grid grid-cols-5 gap-2 pl-2">
								<div class="col-span-5 @xl/inner:col-span-3">
									<span
										class="badge dark:badge-neutral font-semibold {testsInfo[
											selectedTestIndex
										]
											? testsInfo[selectedTestIndex].passed
												? 'text-success'
												: 'text-error dark:text-dark_error'
											: ''}"
										>{testsInfo[selectedTestIndex]
											? testsInfo[selectedTestIndex].passed
												? 'Passing'
												: 'Failing'
											: 'Not submited'}</span
									>
									{#if testsConsoleLogs.length > 0}
										<div
											class="relative grid col-span-4 gap-1 overflow-y-auto"
											style="grid-template-rows: auto 1fr;"
										>
											<span>Logs: </span>
											<div class="flex flex-col overflow-y-auto">
												{#if testsConsoleLogs[selectedTestIndex]}
													{#each testsConsoleLogs[selectedTestIndex] as log}
														<span class="text-sm">{log}</span>
													{/each}
												{/if}
											</div>
										</div>
									{/if}
									<div>
										<span>Expected: </span>
										<div class="flex flex-col items-center gap-1 w-fit">
											<pre
												class="p-2 font-semibold rounded-lg text-semiBody1 bg-light_grey dark:bg-dark_light_grey w-fit">{content[
													'tests'
												][selectedTestIndex].input}</pre>
											<iconify-icon icon="flowbite:arrow-down-outline" />
											<pre
												class="p-2 font-semibold rounded-lg text-semiBody1 bg-light_grey dark:bg-dark_light_grey w-fit">{content[
													'tests'
												][selectedTestIndex].output}</pre>
										</div>
									</div>

									{#if testsInfo[selectedTestIndex]}
										<div>
											<span>Outcome: </span>
											<div class="flex flex-col items-center gap-1 w-fit">
												<pre
													class={`font-semibold gap-1 inline-flex items-center p-2 rounded-lg text-semiBody1 bg-light_grey dark:bg-dark_light_grey w-fit ${
														testsInfo[selectedTestIndex] &&
														testsInfo[selectedTestIndex].passed
															? 'text-success'
															: 'text-error dark:text-dark_error'
													}`}>{content['tests'][selectedTestIndex].input}</pre>
												<iconify-icon icon="flowbite:arrow-down-outline" />
												<pre
													class={`font-semibold gap-1 inline-flex items-center p-2 rounded-lg text-semiBody1 bg-light_grey dark:bg-dark_light_grey w-fit ${
														testsInfo[selectedTestIndex] &&
														testsInfo[selectedTestIndex].passed
															? 'text-success'
															: 'text-error dark:text-dark_error'
													}`}>{JSON.stringify(
														testsInfo[selectedTestIndex].result,
														null,
														4
													)}</pre>
											</div>
										</div>
										<!-- <div>
											<div
												class={`font-semibold gap-1 inline-flex items-center ${
													testsInfo[selectedTestIndex] &&
													testsInfo[selectedTestIndex].passed
														? 'text-success'
														: 'text-error dark:text-dark_error'
												}`}
											>
												<span class="font-semibold"
													>{content['tests'][selectedTestIndex].input}</span
												><iconify-icon
													icon="flowbite:arrow-right-outline"
												/><span class="font-semibold"
													>{testsInfo[selectedTestIndex].result}</span
												> -->
										<!-- <span
														>{testsInfo[selectedTestIndex].passed
															? 'Passed'
															: 'Failed'}</span
													> -->
										<!-- </div>
										</div> -->
									{/if}
								</div>
							</div>
						</div>
					</div></Resizable.Pane
				>
			</Resizable.PaneGroup>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>

<style>
	.grid__auto-rows {
		grid-template-rows: auto 1fr;
	}
	.grid__auto-rows_2 {
		grid-template-rows: auto auto 1fr;
	}

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
