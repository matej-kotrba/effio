<script lang="ts">
	import toast, { Toaster } from 'svelte-french-toast';
	import { testObject } from '~stores/testObject';
	import { applicationStates } from '~stores/applicationStates';
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';

	export let indexParent: number;

	let mapEl: HTMLDivElement;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as GeographyQuestion;

	$: isDarkMode = $applicationStates.darkMode.isDarkMode;

	$: console.log($testObject.questions[indexParent]);

	onMount(async () => {
		const leaflet = await import('leaflet');

		const map = leaflet.map(mapEl).setView();
	});
</script>

<form class="relative flex flex-col gap-4">
	<!-- Display the map -->
	<div bind:this={mapEl} />
	<Toaster />
</form>
