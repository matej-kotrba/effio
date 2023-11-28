<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import 'monaco-editor/min/vs/editor/editor.main.css';
	import type { editor } from 'monaco-editor';
	import { browser } from '$app/environment';
	import { testObject } from '~stores/testObject';
	import Space from '~components/separators/Space.svelte';

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
	let currentDropdownData = {
		index: 0,
		input: '',
		output: ''
	};

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
			value: '',
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

<Dialog title="Test edit" bind:open={openDialog}>
	<span class="text-h6">Input </span><span
		class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
		>for client code</span
	>
	<div
		class="w-full h-[100px] rounded-md overflow-hidden"
		bind:this={inputEditorContainer}
	/>
	<Space gap={20} />
	<span class="text-h6">Output </span><span
		class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
		>for client code</span
	>
	<div
		class="w-full h-[100px] rounded-md overflow-hidden"
		bind:this={outputEditorContainer}
	/>
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
