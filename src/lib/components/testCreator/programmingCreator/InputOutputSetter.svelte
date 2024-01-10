<script lang="ts">
	import { afterUpdate, beforeUpdate, onDestroy, onMount, tick } from 'svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import 'monaco-editor/min/vs/editor/editor.main.css';
	import type { editor } from 'monaco-editor';
	import { browser } from '$app/environment';
	import { testObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';
	import toast from 'svelte-french-toast';
	import Sandbox from '@nyariv/sandboxjs';
	import { gsap } from 'gsap';
	import { Flip } from 'gsap/dist/Flip';

	export let questionIndex: number;
	export let title = '';

	gsap.registerPlugin(Flip);

	$: content = $testObject?.questions[questionIndex]
		.content as ProgrammingQuestion;

	let inputEditorContainer: HTMLDivElement;
	let outputEditorContainer: HTMLDivElement;

	let monaco: typeof import('monaco-editor');
	let inputEditor: editor.IStandaloneCodeEditor;
	let outputEditor: editor.IStandaloneCodeEditor;

	let openDialog: () => void;
	let closeDialog: () => void;
	let currentDropdownData = {
		index: 0,
		input: '',
		output: ''
	};

	const prototypeWhitelist: Map<any, Set<string>> = new Map([]);

	const globals = {};

	const sandbox = new Sandbox({ globals, prototypeWhitelist });

	// export let selectedType: (typeof SUPPORTED_TYPES)[number] | undefined =
	// 	undefined;

	// function onSelectChange(
	// 	e: Event & {
	// 		currentTarget: EventTarget & HTMLSelectElement;
	// 	}
	// ) {
	// 	selectedType = e.currentTarget.value as (typeof SUPPORTED_TYPES)[number];
	// }

	function openDropdown(index: number) {
		if (content.tests[index] === undefined) {
			content.tests[index] = {
				input: '',
				output: ''
			};
		}
		currentDropdownData = {
			index: index,
			input: content.tests[index].input,
			output: content.tests[index].output
		};
		openDialog();
		let inputData = content.tests[index].input;
		let outputData = content.tests[index].output;
		// try {
		// 	inputData = (JSON.parse(inputData) as string).toString();
		// } catch (e) {
		// 	inputData = inputData;
		// }
		// try {
		// 	outputData = (JSON.parse(outputData) as string).toString();
		// } catch (e) {
		// 	outputData = outputData;
		// }
		inputEditor.setValue(inputData);
		outputEditor.setValue(outputData);
		inputEditor.layout();
		outputEditor.layout();
	}

	function onDialogClose(indexOfTest: number) {
		const inputCode = inputEditor.getValue();
		const outputCode = outputEditor.getValue();
		let isError = false;

		try {
			// Check if input is valid and not an expression
			const exec = sandbox.compile(`return ${inputCode}`);
			const scriptResult = exec().run();
			if (
				typeof scriptResult !== 'string' &&
				typeof scriptResult !== 'number' &&
				typeof scriptResult !== 'boolean' &&
				typeof scriptResult !== null &&
				typeof scriptResult !== undefined &&
				typeof scriptResult !== 'object'
			) {
				throw new Error(
					'Input must be a string, number, boolean, array or object'
				);
			}

			const input = inputCode;

			content.tests[indexOfTest].input = input;

			if (content.errors.tests === undefined) {
				content.errors.tests = [];
			}
			if (content.errors.tests[indexOfTest] === undefined) {
				content.errors.tests[indexOfTest] = {};
			}
			content.errors.tests[indexOfTest].input = '';
		} catch (e) {
			toast.error('Invalid syntax in input editor');
			if (content.errors.tests === undefined) {
				content.errors.tests = [];
			}
			if (content.errors.tests[indexOfTest] === undefined) {
				content.errors.tests[indexOfTest] = {};
			}
			content.errors.tests[indexOfTest].input = (e as Error).message;
			isError = true;
		}

		try {
			// Check if input is valid and not an expression
			const exec = sandbox.compile(`return ${outputCode}`);
			const scriptResult = exec().run();
			if (
				typeof scriptResult !== 'string' &&
				typeof scriptResult !== 'number' &&
				typeof scriptResult !== 'boolean' &&
				typeof scriptResult !== null &&
				typeof scriptResult !== undefined &&
				typeof scriptResult !== 'object'
			) {
				throw new Error(
					'Input must be a string, number, boolean, array or object'
				);
			}

			const input = outputCode;

			content.tests[indexOfTest].output = input;

			if (content.errors.tests === undefined) {
				content.errors.tests = [];
			}
			if (content.errors.tests[indexOfTest] === undefined) {
				content.errors.tests[indexOfTest] = {};
			}
			content.errors.tests[indexOfTest].output = '';
		} catch (e) {
			toast.error('Invalid syntax in input editor');
			if (content.errors.tests === undefined) {
				content.errors.tests = [];
			}
			if (content.errors.tests[indexOfTest] === undefined) {
				content.errors.tests[indexOfTest] = {};
			}
			content.errors.tests[indexOfTest].output = (e as Error).message;
			isError = true;
		}

		if (!isError) {
			closeDialog();
		}
	}

	function onAddTest() {
		content.tests = [
			...content.tests,
			{
				input: '',
				output: ''
			}
		];
	}

	async function deleteTest(index: number) {
		content.tests = content.tests.filter((_, i) => i !== index);

		// const items = document.querySelectorAll('.test');

		// let state: Flip.FlipState;

		// items.forEach(async (item, index) => {
		// 	if (index === 0) return;

		// 	const temp = item.cloneNode();

		// 	await tick();
		// 	Flip.fit(temp, item);
		// state = Flip.getState(item);

		// await tick();
		// Flip.from(state, {
		// 	duration: 0.6,
		// 	absolute: true
		// });
		// });
	}

	onMount(async () => {
		monaco = await import('monaco-editor');

		await Promise.all([
			import('monaco-editor/esm/vs/language/json/json.worker?worker')
		]).then(([jsonWorker]) => {
			self.MonacoEnvironment = {
				getWorker(_) {
					return new jsonWorker.default();
				}
			};
		});
		inputEditor = monaco.editor.create(inputEditorContainer, {
			value: '58',
			language: 'json',
			theme: 'vs-dark',
			contextmenu: false
		});
		outputEditor = monaco.editor.create(outputEditorContainer, {
			value: '',
			language: 'json',
			theme: 'vs-dark',
			contextmenu: false
		});

		window.addEventListener('resize', () => inputEditor.layout());
		window.addEventListener('resize', () => outputEditor.layout());
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', () => inputEditor.layout());
			window.removeEventListener('resize', () => outputEditor.layout());
			inputEditor.dispose();
			outputEditor.dispose();
		}
	});
</script>

<Dialog title="Test edit" bind:open={openDialog} bind:close={closeDialog}>
	<span class="text-h6">Input </span><span
		class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
		>for client code</span
	>
	<div
		class="w-full h-[100px] rounded-md overflow-hidden"
		bind:this={inputEditorContainer}
	/>
	<p class="text-body2 text-error dark:text-dark_error">
		{content &&
		content.errors.tests &&
		content.errors.tests[currentDropdownData.index] &&
		content.errors.tests[currentDropdownData.index].input
			? content.errors.tests[currentDropdownData.index].input
			: ''}
	</p>
	<Space gap={20} />
	<span class="text-h6">Output </span><span
		class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
		>of client code</span
	>
	<div
		class="w-full h-[100px] rounded-md overflow-hidden"
		bind:this={outputEditorContainer}
	/>
	<p class="text-body2 text-error dark:text-dark_error">
		{content &&
		content.errors.tests &&
		content.errors.tests[currentDropdownData.index] &&
		content.errors.tests[currentDropdownData.index].output
			? content.errors.tests[currentDropdownData.index].output
			: ''}
	</p>
	<Space gap={20} />
	<div class="flex justify-end">
		<button
			class="btn"
			type="button"
			on:click={() => onDialogClose(currentDropdownData.index)}>Save</button
		>
	</div>
</Dialog>

<div class="flex gap-2">
	<h5 class="text-h5">Tests</h5>
	<button
		type="button"
		on:click={onAddTest}
		class={`grid p-1 border-2 rounded-md bg-light_whiter dark:bg-dark_light_grey place-content-center
		 border-light_text_black_40 dark:border-dark_text_white_40 hover:bg-light_grey duration-150`}
	>
		<iconify-icon icon="ic:round-plus" class="text-3xl" />
	</button>
</div>
<span class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
	>* For sake of your task you should create as many test with as many edge
	cases as possible</span
>
<div class="@container">
	<h6>{title}</h6>
	<div
		class="grid gap-2 @sm:grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @7xl:grid-cols-6"
	>
		{#each content['tests'] as test, index}
			<div class="relative w-full group test">
				<button
					type="button"
					class="flex justify-between w-full gap-2 btn flex-nowrap dark:bg-dark_light_grey dark:border-dark_light_grey dark:text-dark_text_white"
					on:click={() => openDropdown(index)}
				>
					<span class="font-semibold text-h6">{index + 1}.</span>
					<div
						class="w-full overflow-hidden text-left text-ellipsis whitespace-nowrap"
					>
						<span>I: </span>
						<span
							class={`${test.input ? '' : 'text-error dark:text-dark_error'}`}
							>{test.input ? test.input : 'Unset'}</span
						>
						<span>O: </span>
						<span
							class={`${test.output ? '' : 'text-error dark:text-dark_error'}`}
							>{test.output ? test.output : 'Unset'}</span
						>
					</div>
				</button>
				<button
					type="button"
					on:click={() => deleteTest(index)}
					class="absolute grid p-1 duration-100 -translate-y-1/2 rounded-md opacity-100 md:opacity-0 right-2 top-1/2 place-content-center group-hover:opacity-100 hover:bg-light_grey_dark dark:hover:bg-dark_grey"
				>
					<iconify-icon icon="fluent:delete-28-filled" class="text-2xl" />
				</button>
			</div>
		{/each}
	</div>
</div>
