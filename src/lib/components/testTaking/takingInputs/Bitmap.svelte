<script lang="ts">
	import type { LatLngBoundsExpression, Marker } from 'leaflet';
	import { onDestroy, onMount } from 'svelte';
	import type { MiddlewareLocation } from '~components/testCreator/creatorInputs/Geography.svelte';
	import {
		BITMAP_ZOOM_MIN,
		BITMAP_ZOOM_MAX,
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
	export let resultFormat: QuestionServerCheckResponse<BitmapQuestion> | null =
		null;
	export let testObject: TestObject;

	$: content = testObject.questions[questionIndex].content as BitmapQuestion;

	let mapEl: HTMLDivElement;

	let leaflet: typeof import('leaflet');

	let answerMarker: Marker;
	let map: L.Map;
	let toleranceCircle: L.Circle;

	let bitmapImage: HTMLImageElement;

	function checkAndSetLocation(location: { lat: number; lng: number }) {
		if (!bitmapImage) return;
		// Check if marker is out of the bounds
		if (location.lat < 0) {
			location.lat = 0;
		} else if (location.lat > bitmapImage.height) {
			location.lat = bitmapImage.height;
		}
		if (location.lng < 0) {
			location.lng = 0;
		} else if (location.lng > bitmapImage.width) {
			location.lng = bitmapImage.width;
		}
		answerMarker.setLatLng(location);
		content.answerPoint.location = [location['lat'], location['lng']];
	}

	$: {
		try {
			toleranceCircle.setLatLng(content.answerPoint.location);
		} catch (e) {}
	}

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
					radius: resultFormat.correctAnswer.tolerence,
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

		if (content.imageUrl) {
			const image = new Image();
			image.src = content.imageUrl;
			image.onload = () => {
				bitmapImage = image;

				if (leaflet && content.imageUrl) {
					map = leaflet
						.map(mapEl, {
							crs: leaflet.CRS.Simple
						})
						.setView([image.height / 2, image.width / 2], content.zoom);

					map.setMinZoom(BITMAP_ZOOM_MIN);
					map.setMaxZoom(BITMAP_ZOOM_MAX);
					map.setZoom(content.zoom);

					answerMarker = leaflet
						.marker(content.answerPoint.location, {
							draggable: true
						})
						.addTo(map)
						.bindTooltip('Answer position');

					answerMarker.on('dragend', (e) => {
						const location = e.target.getLatLng() as {
							lat: number;
							lng: number;
						};

						checkAndSetLocation(location);
					});

					toleranceCircle = leaflet
						.circle(answerMarker.getLatLng(), {
							radius: content.tolerence,
							color: '#6433f0',
							fillColor: '#6433f035',
							fillOpacity: 0.5
						})
						.addTo(map);

					const bounds = [
						[0, 0],
						[image.height, image.width]
					] as LatLngBoundsExpression;

					leaflet.imageOverlay(content.imageUrl, bounds).addTo(map);

					map.setMaxBounds([
						[0, 0],
						[image.height, image.width]
					]);

					map.fitBounds(bounds);

					checkAndSetLocation(
						leaflet.latLng({
							lat: image.height / 2,
							lng: image.width / 2
						})
					);
				}
			};
		}
	});

	onDestroy(() => {
		map?.remove();
		answerMarker?.remove();
	});
</script>

<div
	class="flex flex-col gap-2"
	use:intersect={{ once: true }}
	on:intersect={() => {
		map?.invalidateSize();
	}}
>
	<span class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
		>You have tolerance of {content.tolerence} px</span
	>
	<div class="w-full h-[300px] relative">
		<div bind:this={mapEl} class="absolute inset-0 z-[10]" />
	</div>
</div>
