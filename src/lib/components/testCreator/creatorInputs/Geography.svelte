<script lang="ts">
	import toast, { Toaster } from 'svelte-french-toast';
	import { testObject } from '~stores/testObject';
	import { applicationStates } from '~stores/applicationStates';
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import type { Marker } from 'leaflet';
	import {
		LATITUDE_MIN,
		LATITUDE_MAX,
		LONGITUDE_MIN,
		LONGITUDE_MAX,
		latitudeSchema,
		longitudeSchema
	} from '~schemas/textInput';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';

	export let indexParent: number;

	let mapEl: HTMLDivElement;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as GeographyQuestion;

	$: isDarkMode = $applicationStates.darkMode.isDarkMode;

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

	$: {
		try {
			const parsedLat = latitudeSchema.parse(Number(initialLocation.lat));
			content.initial.location[0] = parsedLat;
		} catch (e) {
			initialLocation.lat = String(content.initial.location[0]);
		}
		try {
			const parsedLng = longitudeSchema.parse(Number(initialLocation.lng));
			content.initial.location[1] = parsedLng;
		} catch (e) {
			initialLocation.lng = String(content.initial.location[1]);
		}
		try {
			initialMarker.setLatLng(content.initial.location);
		} catch (e) {}
	}
	$: {
		try {
			const parsedLat = latitudeSchema.parse(Number(answerLocation.lat));
			content.answerPoint.location[0] = parsedLat;
		} catch (e) {
			answerLocation.lat = String(content.answerPoint.location[0]);
		}
		try {
			const parsedLng = latitudeSchema.parse(Number(answerLocation.lng));
			content.answerPoint.location[1] = parsedLng;
		} catch (e) {
			answerLocation.lng = String(content.answerPoint.location[1]);
		}
		try {
			answerMarker.setLatLng(content.answerPoint.location);
		} catch (e) {}
	}

	onMount(async () => {
		const leaflet = await import('leaflet');

		const map = leaflet
			.map(mapEl)
			.setView(content.initial.location, content.initial.zoom);

		let bounds = leaflet.latLngBounds(
			leaflet.latLng(LATITUDE_MIN, LONGITUDE_MIN),
			leaflet.latLng(LATITUDE_MAX, LONGITUDE_MAX)
		);

		map.setMaxBounds(bounds);
		map.setMinZoom(2);

		leaflet
			.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
			.addTo(map);

		initialMarker = leaflet
			.marker(content.initial.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(map)
			.bindTooltip('Initial User View');

		answerMarker = leaflet
			.marker(content.answerPoint.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(map)
			.bindTooltip('Marking answer position');

		initialMarker.on('dragend', (e) => {
			const location = e.target.getLatLng() as {
				lat: number;
				lng: number;
			};
			initialLocation.lat = String(location.lat);
			initialLocation.lng = String(location.lng);
		});
		answerMarker.on('dragend', (e) => {
			const location = e.target.getLatLng() as {
				lat: number;
				lng: number;
			};
			answerLocation.lat = String(location.lat);
			answerLocation.lng = String(location.lng);
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
				displayOutside={true}
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
				displayOutside={true}
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
	</div>
	<div class="flex gap-2">
		<ErrorEnhance
			error={content.answerPoint.errors ? content.answerPoint.errors[0] : ''}
		>
			<TextInputSimple
				displayOutside={true}
				title="Answer Point Latitude"
				inputProperties={{ type: 'number' }}
				titleName="lat_answer"
				validationSchema={latitudeSchema}
				bind:inputValue={answerLocation.lat}
				on:error={(event) => {
					if (!content.answerPoint.errors) content.answerPoint.errors = [];
					content.answerPoint.errors[0] = event.detail;
				}}
			/>
		</ErrorEnhance>
		<ErrorEnhance
			error={content.answerPoint.errors ? content.answerPoint.errors[1] : ''}
		>
			<TextInputSimple
				displayOutside={true}
				title="Answer Point Latitude"
				inputProperties={{ type: 'number' }}
				titleName="lng_answer"
				validationSchema={longitudeSchema}
				bind:inputValue={answerLocation.lng}
				on:error={(event) => {
					if (!content.answerPoint.errors) content.answerPoint.errors = [];
					content.answerPoint.errors[1] = event.detail;
				}}
			/>
		</ErrorEnhance>
	</div>
	<div class="w-full h-[300px] relative">
		<div bind:this={mapEl} class="absolute inset-0 z-[10]" />
	</div>
	<Toaster />
</form>
