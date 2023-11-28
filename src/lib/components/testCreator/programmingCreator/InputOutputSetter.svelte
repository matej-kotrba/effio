<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import 'monaco-editor/min/vs/editor/editor.main.css';
	import type { editor } from 'monaco-editor';
	import { browser } from '$app/environment';
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let title = '';

	$: content = $testObject.questions[questionIndex]
		.content as ProgrammingQuestion;

	let editorContainer: HTMLDivElement;

	let monaco: typeof import('monaco-editor');
	let editor: editor.IStandaloneCodeEditor;

	// export let selectedType: (typeof SUPPORTED_TYPES)[number] | undefined =
	// 	undefined;

	// function onSelectChange(
	// 	e: Event & {
	// 		currentTarget: EventTarget & HTMLSelectElement;
	// 	}
	// ) {
	// 	selectedType = e.currentTarget.value as (typeof SUPPORTED_TYPES)[number];
	// }

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
		editor = monaco.editor.create(editorContainer, {
			value: '{\n\t\n}',
			language: 'json',
			theme: 'vs-dark-plus'
		});

		window.addEventListener('resize', () => editor.layout());
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', () => editor.layout());
			editor.dispose();
		}
	});
</script>

<Dialog title="Test edit">
	<div id="container" bind:this={editorContainer} />
</Dialog>
<div>
	<h6>{title}</h6>
	<div>
		{#each content['tests'] as test, index}
			<div>Test {index + 1}</div>
		{/each}
	</div>
</div>
