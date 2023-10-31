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

		const map = leaflet
			.map(mapEl)
			.setView(content.initial.location, content.initial.zoom);

		leaflet
			.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
			.addTo(map);

		const markerPrague = leaflet
			.marker(content.initial.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(map);
	});
</script>

<form class="relative flex flex-col gap-4">
	<!-- Display the map -->
	<div class="w-[300px] aspect-square">
		<div
			bind:this={mapEl}
			class="absolute inset-0 z-[10]"
			on:dragend={(e) => {
				console.log(e);
			}}
		/>
	</div>
	<Toaster />
</form>
