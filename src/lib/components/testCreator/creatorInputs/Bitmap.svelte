<script lang="ts">
	import { getTestObject } from '~stores/testObject';
	import 'leaflet/dist/leaflet.css';
	import { onDestroy, onMount } from 'svelte';
	import type { Circle, LatLngBoundsExpression, Marker } from 'leaflet';
	import {
		GEOGRAPHY_TOLERANCE_MIN,
		GEOGRAPHY_TOLERANCE_MAX,
		geographyToleranceSchema,
		GEOGRAPHY_TOLERANCE_DEFAULT,
		BITMAP_ZOOM_MIN,
		BITMAP_ZOOM_MAX,
		BITMAP_TOLERANCE_MIN,
		BITMAP_TOLERANCE_MAX,
		BITMAP_TOLERANCE_DEFAULT
	} from '~schemas/testValidation';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import ImageImportV2, {
		setImageUpload
	} from '~components/inputs/ImageImportV2.svelte';
	import {
		ALLOWED_IMAGE_TYPES,
		IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB
	} from '~helpers/constants';
	import type L from 'leaflet';

	export let indexParent: number;
	let maxImageSizeInMB = IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB;

	const testObject = getTestObject();

	let uploadedImageUrl: string | null = null;

	let mapEl: HTMLDivElement;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as BitmapQuestion;

	//TODO: Rerender happens even if updating only tolerance

	let leaflet: typeof L | undefined;

	let leafletMap: L.Map;

	let answerMarker: Marker;
	let answerMarkerToleranceCircle: Circle;

	function onZoomRangeInput(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (!e.currentTarget) return;
		leafletMap.setZoom(e.currentTarget.valueAsNumber ?? BITMAP_ZOOM_MIN);
	}

	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		setImageUpload(
			e,
			ALLOWED_IMAGE_TYPES,
			maxImageSizeInMB,
			(file, resultUrl) => {
				content.imageFile = file;
				uploadedImageUrl = resultUrl;
				setImageToMap(uploadedImageUrl);
			}
		);
	}

	function checkAndSetLocation(location: { lat: number; lng: number }) {
		if (!currentImageSizes) return;
		// Check if marker is out of the bounds
		if (location.lat < 0) {
			location.lat = 0;
		} else if (location.lat > currentImageSizes[1]) {
			location.lat = currentImageSizes[1];
		}
		if (location.lng < 0) {
			location.lng = 0;
		} else if (location.lng > currentImageSizes[0]) {
			location.lng = currentImageSizes[0];
		}
		answerMarker.setLatLng(location);
		content.answerPoint.location = [location['lat'], location['lng']];
	}

	$: {
		if (typeof content.tolerence === 'string' && content.tolerence !== '') {
			content.tolerence = Number(content.tolerence) ?? BITMAP_TOLERANCE_DEFAULT;
		}
	}

	$: answerMarkerToleranceCircle?.setRadius(content.tolerence);

	$: {
		try {
			answerMarkerToleranceCircle.setLatLng(content.answerPoint.location);
		} catch (e) {}
	}

	let currentImageLayer: L.ImageOverlay | undefined = undefined;
	let currentImageURL: string | undefined = undefined;
	let currentImageSizes: [number, number] | undefined = undefined;

	function setImageToMap(imageUrl: string, resetMarker: boolean = true) {
		const image = new Image();
		image.src = imageUrl;
		image.onload = () => {
			if (currentImageLayer) {
				currentImageLayer.remove();
			}
			if (imageUrl && leaflet) {
				const bounds = [
					[0, 0],
					[image.height, image.width]
				] as LatLngBoundsExpression;

				currentImageSizes = [image.width, image.height];
				currentImageLayer = leaflet
					.imageOverlay(imageUrl, bounds)
					.addTo(leafletMap);
				currentImageURL = imageUrl;

				// answerMarker.setLatLng([image.height / 2, image.width / 2]);
				// content.answerPoint.location = [image.height / 2, image.width / 2];

				leafletMap.setMaxBounds([
					[0, 0],
					[image.height, image.width]
				]);

				leafletMap.fitBounds(bounds);
				if (resetMarker) {
					checkAndSetLocation({ lat: image.height / 2, lng: image.width / 2 });
				}
			}
		};
	}

	// $: {
	// 	if (uploadedImageUrl && currentImageURL !== uploadedImageUrl) {
	// 	}
	// }

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

		leafletMap = leaflet
			.map(mapEl, {
				crs: leaflet.CRS.Simple
			})
			.setView(content.answerPoint.location, content.zoom);

		leaflet.Marker.prototype.options.icon = DefaultIcon;

		leafletMap.setMinZoom(BITMAP_ZOOM_MIN);
		leafletMap.setMaxZoom(BITMAP_ZOOM_MAX);
		leafletMap.setZoom(content.zoom);

		answerMarker = leaflet
			.marker(content.answerPoint.location, {
				draggable: true
			})
			.addTo(leafletMap)
			.bindTooltip('Marking answer position');

		answerMarkerToleranceCircle = leaflet
			.circle(content.answerPoint.location, {
				color: '#6433f0',
				fillColor: '#6433f035',
				fillOpacity: 0.5,
				radius: content.tolerence
			})
			.addTo(leafletMap);

		answerMarker.on('dragend', (e) => {
			const location = e.target.getLatLng() as {
				lat: number;
				lng: number;
			};

			checkAndSetLocation(location);
		});

		leafletMap.on('zoom', (e) => {
			content.zoom = leafletMap.getZoom();
		});

		if (content.imageFile instanceof File || content.imageUrl) {
			// Meaning that the image was already used so the location is not new
			answerMarker.setLatLng(content.answerPoint.location);
		}

		if (content.imageFile instanceof File) {
			const reader = new FileReader();
			reader.readAsDataURL(content.imageFile);
			reader.onload = () => {
				uploadedImageUrl = reader.result as string;
				setImageToMap(uploadedImageUrl, false);
			};
		}
	});

	onDestroy(() => {
		leafletMap?.remove();
		answerMarker?.remove();
	});
</script>

<form class="relative flex flex-col gap-4">
	<ImageImportV2
		{onImageUpload}
		uploadedImageUrl={uploadedImageUrl || content?.imageUrl}
		allowedImageTypes={ALLOWED_IMAGE_TYPES}
		inputId={indexParent}
	/>
	<Collapsible title="Show options" openedTitle="Hide options" class="w-full">
		<div>
			<div>
				<span class="text-body2">Answer Tolerance</span>
				<input
					type="range"
					min={BITMAP_TOLERANCE_MIN}
					max={BITMAP_TOLERANCE_MAX}
					bind:value={content.tolerence}
					class="range range-sm range-primary dark:range-accent"
				/>
			</div>
			<ErrorEnhance error={content.errors?.tolerence}>
				<TextInputSimple
					displayOutside={true}
					title="Tolerance"
					inputProperties={{ type: 'number' }}
					titleName="tolerance"
					validationSchema={geographyToleranceSchema}
					bind:inputValue={content.tolerence}
					on:error={(event) => {
						if (!content.errors) content.errors = {};
						content.errors.tolerence = event.detail;
					}}
					on:focusout={() => {
						if (!content.tolerence) {
							content.tolerence = GEOGRAPHY_TOLERANCE_DEFAULT;
							if (content.errors) content.errors.tolerence = '';
						}
					}}
				/>
			</ErrorEnhance>
		</div>
		<div class="flex">
			<div>
				<span class="text-body2">Zoom Level</span>
				<input
					type="range"
					min={BITMAP_ZOOM_MIN}
					max={BITMAP_ZOOM_MAX}
					bind:value={content.zoom}
					class="range range-sm range-primary dark:range-accent"
					on:input={onZoomRangeInput}
				/>
			</div>
		</div>
	</Collapsible>
	<!-- Display the map -->
	<div class="w-full h-[300px] relative">
		{#if !uploadedImageUrl && !content.imageUrl}
			<div
				class="absolute inset-0 grid bg-light_grey_dark dark:bg-dark_light_grey place-content-center z-[100]"
			>
				<p>No image provided</p>
			</div>
		{/if}
		<div bind:this={mapEl} class="absolute inset-0 z-[10]" />
	</div>
</form>
