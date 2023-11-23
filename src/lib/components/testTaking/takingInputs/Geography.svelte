<script lang="ts">
	import type { Marker } from 'leaflet';
	import { onDestroy, onMount } from 'svelte';
	import type { MiddlewareLocation } from '~components/testCreator/creatorInputs/Geography.svelte';
	import {
		LATITUDE_MAX,
		LATITUDE_MIN,
		LONGITUDE_MAX,
		LONGITUDE_MIN,
		latitudeSchema,
		longitudeSchema
	} from '~schemas/textInput';
	import { testObject } from '~stores/testObject';
	import 'leaflet/dist/leaflet.css';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<GeographyQuestion> | null =
		null;

	$: content = $testObject.questions[questionIndex]
		.content as GeographyQuestion;

	let mapEl: HTMLDivElement;

	let answerLocation: MiddlewareLocation = {
		lat: String(
			($testObject.questions[questionIndex].content as GeographyQuestion)
				.answerPoint.location[0]
		),
		lng: String(
			($testObject.questions[questionIndex].content as GeographyQuestion)
				.answerPoint.location[1]
		)
	};

	let answerMarker: Marker;
	let map: L.Map;

	onMount(async () => {
		const leaflet = await import('leaflet');

		let DefaultIcon = leaflet.icon({
			iconUrl: '/imgs/icons/marker/marker-icon.png',
			shadowUrl: '/imgs/icons/marker/marker-shadow.png',
			iconRetinaUrl: '/imgs/icons/marker/marker-icon-2x.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize: [41, 41]
		});

		leaflet.Marker.prototype.options.icon = DefaultIcon;

		map = leaflet
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

		answerMarker = leaflet
			.marker(content.answerPoint.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(map)
			.bindTooltip('Answer position');

		answerMarker.on('dragend', (e) => {
			const location = e.target.getLatLng() as {
				lat: number;
				lng: number;
			};
			answerLocation.lat = String(location.lat.toFixed(6));
			answerLocation.lng = String(location.lng.toFixed(6));
		});
	});

	onDestroy(() => {
		map?.remove();
		answerMarker?.remove();
	});

	$: {
		try {
			const parsedLat = latitudeSchema.parse(Number(answerLocation.lat));
			content.answerPoint.location[0] = parsedLat;
		} catch (e) {
			answerLocation.lat = String(content.answerPoint.location[0]);
		}
		try {
			const parsedLng = longitudeSchema.parse(Number(answerLocation.lng));
			content.answerPoint.location[1] = parsedLng;
		} catch (e) {
			answerLocation.lng = String(content.answerPoint.location[1]);
		}
		try {
			answerMarker.setLatLng(content.answerPoint.location);
		} catch (e) {}
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
		>You have tolerance of {content.tolerence} km</span
	>
	<div class="w-full h-[300px] relative">
		<div bind:this={mapEl} class="absolute inset-0 z-[10]" />
	</div>
</div>
