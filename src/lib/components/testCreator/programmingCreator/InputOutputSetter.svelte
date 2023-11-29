<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import 'monaco-editor/min/vs/editor/editor.main.css';
	import type { editor } from 'monaco-editor';
	import { browser } from '$app/environment';
	import { testObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';
	import toast from 'svelte-french-toast';
	import Sandbox from '@nyariv/sandboxjs';

	export let questionIndex: number;
	export let title = '';

	$: content = $testObject.questions[questionIndex]
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
		currentDropdownData = {
			index: index,
			input: content.tests[index].input,
			output: content.tests[index].output
		};
		openDialog();
	}

	function onDialogClose(indexOfTest: number) {
		const inputCode = inputEditor.getValue();
		let isError = false;

		try {
			// Check if input is valid and not an expression
			const exec = sandbox.compile(`return ${inputCode}`);
			const scriptResult = exec().run();
			console.log('RESULT', scriptResult, typeof scriptResult);
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

			const input = JSON.stringify(inputCode);

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
			const exec = sandbox.compile(`return ${inputCode}`);
			const scriptResult = exec().run();
			console.log('RESULT', scriptResult, typeof scriptResult);
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

			const input = JSON.stringify(inputCode);

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

	onMount(async () => {
		monaco = await import('monaco-editor');

		await Promise.all([
			import('monaco-editor/esm/vs/language/json/json.worker?worker'),
			import('monaco-editor/esm/vs/editor/editor.worker?worker')
		]).then(([jsonWorker, editorWorker]) => {
			self.MonacoEnvironment = {
				getWorker(_, label) {
					return new jsonWorker.default();
				}
			};
		});
		inputEditor = monaco.editor.create(inputEditorContainer, {
			value: '58',
			language: 'json',
			theme: 'vs-dark'
		});
		outputEditor = monaco.editor.create(outputEditorContainer, {
			value: '',
			language: 'json',
			theme: 'vs-dark'
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
		{content.errors.tests &&
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
		{content.errors.tests &&
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
<div>
	<h6>{title}</h6>
	<div>
		{#each content['tests'] as test, index}
			<button
				type="button"
				class="btn min-w-[240px]"
				on:click={() => openDropdown(index)}>Test {index + 1}</button
			>
		{/each}
	</div>
</div>
