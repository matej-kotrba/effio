<script lang="ts">
	import type { Marker } from 'leaflet';
	import { onDestroy, onMount, afterUpdate } from 'svelte';
	import type { MiddlewareLocation } from '~components/testCreator/creatorInputs/Geography.svelte';
	import {
		LATITUDE_MAX,
		LATITUDE_MIN,
		LONGITUDE_MAX,
		LONGITUDE_MIN,
		latitudeSchema,
		longitudeSchema
	} from '~schemas/textInput';
	import type { TestObject } from '~stores/testObject';
	import 'leaflet/dist/leaflet.css';
	import { intersect } from '~use/intersectionObserver';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<GeographyQuestion> | null =
		null;
	export let testObject: TestObject;

	$: content = testObject.questions[questionIndex].content as GeographyQuestion;

	let mapEl: HTMLDivElement;

	let answerLocation: MiddlewareLocation = {
		lat: String(
			(testObject.questions[questionIndex].content as GeographyQuestion)
				.answerPoint.location[0]
		),
		lng: String(
			(testObject.questions[questionIndex].content as GeographyQuestion)
				.answerPoint.location[1]
		)
	};

	let leaflet: typeof import('leaflet');

	let answerMarker: Marker;
	let map: L.Map;
	let toleranceCircle: L.Circle;

	$: {
		if (resultFormat) {
			answerMarker?.dragging?.disable();
			if (toleranceCircle) {
				toleranceCircle.remove();
			}
		} else {
			answerMarker?.dragging?.enable();
			if (toleranceCircle) {
				toleranceCircle.addTo(map);
			}
		}
	}

	let resultMarker: Marker;
	let resultToleranceCircle: L.Circle;
	$: {
		if (resultFormat && leaflet) {
			resultMarker = leaflet
				.marker(resultFormat.correctAnswer.answerPoint.location)
				.addTo(map);

			resultToleranceCircle = leaflet
				.circle(resultFormat.correctAnswer.answerPoint.location, {
					radius: resultFormat.correctAnswer.tolerence * 1000,
					color: resultFormat.isCorrect ? '#1ac725' : '#f03737',
					fillColor: resultFormat.isCorrect ? '#1ac72535' : '#f0373735',
					fillOpacity: 0.5
				})
				.bindTooltip('Correct answer position')
				.addTo(map);
		} else {
			resultMarker?.remove();
			resultToleranceCircle?.remove();
		}
	}

	onMount(async () => {
		leaflet = await import('leaflet');

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

		toleranceCircle = leaflet
			.circle(content.initial.location, {
				radius: content.tolerence * 1000,
				color: '#6433f0',
				fillColor: '#6433f035',
				fillOpacity: 0.5
			})
			.addTo(map);

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
			toleranceCircle.setLatLng(content.answerPoint.location);
		} catch (e) {}
	}
</script>

<div
	class="flex flex-col gap-2"
	use:intersect={{ once: true }}
	on:intersect={() => {
		map?.invalidateSize();
	}}
>
	<span class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
		>You have tolerance of {content.tolerence} km</span
	>
	<div class="w-full h-[300px] relative">
		<div bind:this={mapEl} class="absolute inset-0 z-[10]" />
	</div>
</div>
