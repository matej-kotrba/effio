<script lang="ts">
	import toast, { Toaster } from 'svelte-french-toast';
	import { testObject } from '~stores/testObject';
	import { applicationStates } from '~stores/applicationStates';
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import type { Marker } from 'leaflet';
	import TextInput from '~components/inputs/TextInput.svelte';
	import { latitudeSchema, longitudeSchema } from '~schemas/textInput';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';

	export let indexParent: number;

	let mapEl: HTMLDivElement;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as GeographyQuestion;

	$: isDarkMode = $applicationStates.darkMode.isDarkMode;

	$: console.log($testObject.questions[indexParent]);

	let initialMarker: Marker;
	let answerMarker: Marker;

	type MiddlewareLocation = {
		lat: string;
		lng: string;
	};

	let answerLocation: MiddlewareLocation = {
		lat: String(
			($testObject.questions[indexParent].content as GeographyQuestion)
				.answerPoint.location[0]
		),
		lng: String(
			($testObject.questions[indexParent].content as GeographyQuestion)
				.answerPoint.location[1]
		)
	};

	let initialLocation: MiddlewareLocation = {
		lat: String(
			($testObject.questions[indexParent].content as GeographyQuestion).initial
				.location[0]
		),
		lng: String(
			($testObject.questions[indexParent].content as GeographyQuestion).initial
				.location[1]
		)
	};

	onMount(async () => {
		const leaflet = await import('leaflet');

		const map = leaflet
			.map(mapEl)
			.setView(content.initial.location, content.initial.zoom);

		leaflet
			.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
			.addTo(map);

		initialMarker = leaflet
			.marker(content.initial.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(map);

		answerMarker = leaflet.marker(content.answerPoint.location, {
			draggable: true,
			autoPan: true
		});
	});
</script>

<form class="relative flex flex-col gap-4">
	<!-- Display the map -->
	<div class="flex gap-2">
		<ErrorEnhance
			error={content.initial.errors ? content.initial.errors[0] : ''}
		>
			<TextInputSimple
				title="Initial View Latitude"
				inputProperties={{ type: 'number' }}
				titleName="lat"
				validationSchema={latitudeSchema}
				bind:inputValue={initialLocation.lat}
				on:error={(event) => {
					if (!content.initial.errors) content.initial.errors = [];
					content.initial.errors[0] = event.detail;
				}}
			/>
		</ErrorEnhance>
		<ErrorEnhance
			error={content.initial.errors ? content.initial.errors[1] : ''}
		>
			<TextInputSimple
				title="Initial View Latitude"
				inputProperties={{ type: 'number' }}
				titleName="lng"
				validationSchema={longitudeSchema}
				bind:inputValue={initialLocation.lng}
				on:error={(event) => {
					if (!content.initial.errors) content.initial.errors = [];
					content.initial.errors[1] = event.detail;
				}}
			/>
		</ErrorEnhance>
		<!-- <TextInput
			title="Initial View Latitude"
			inputProperties={{ type: 'number' }}
			titleName="lat"
			validationSchema={latitudeSchema}
			bind:inputValue={initialLocation.lat}
			on:error={(event) => {
				content.initial.location[0] = event.detail;
			}}
		/>
		<TextInput
			title="Initial View Latitude"
			inputProperties={{ type: 'number' }}
			titleName="lng"
			validationSchema={longitudeSchema}
			bind:inputValue={initialLocation.lng}
			on:error={(event) => {
				content.initial.location[0] = event.detail;
			}}
		/> -->
	</div>
	<div class="w-full h-[300px] relative">
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
