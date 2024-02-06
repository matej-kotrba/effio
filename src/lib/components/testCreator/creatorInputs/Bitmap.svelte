<script lang="ts">
	import { getTestObject } from '~stores/testObject';
	import 'leaflet/dist/leaflet.css';
	import { onDestroy, onMount } from 'svelte';
	import type { Circle, Marker } from 'leaflet';
	import {
		LATITUDE_MIN,
		LATITUDE_MAX,
		LONGITUDE_MIN,
		LONGITUDE_MAX,
		latitudeSchema,
		longitudeSchema,
		GEOGRAPHY_TOLERANCE_MIN,
		GEOGRAPHY_TOLERANCE_MAX,
		geographyToleranceSchema,
		GEOGRAPHY_TOLERANCE_DEFAULT,
		GEOGRAPHY_ZOOM_MIN,
		GEOGRAPHY_ZOOM_MAX
	} from '~schemas/textInput';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import type { MiddlewareLocation } from './Geography.svelte';
	import ImageImportV2, {
		setImageUpload
	} from '~components/inputs/ImageImportV2.svelte';
	import {
		ALLOWED_IMAGE_TYPES,
		IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB
	} from '~helpers/constants';

	export let indexParent: number;
	let maxImageSizeInMB = IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB;

	const testObject = getTestObject();

	let uploadedImageUrl: string | null = null;

	let mapEl: HTMLDivElement;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as BitmapQuestion;

	//TODO: Rerender happens even if updating only tolerance

	let leafletMap: L.Map;

	let initialMarker: Marker;
	let answerMarker: Marker;
	let answerMarkerToleranceCircle: Circle;

	let answerLocation: MiddlewareLocation = {
		lat: String(
			($testObject.questions[indexParent].content as BitmapQuestion).answerPoint
				.location[0]
		),
		lng: String(
			($testObject.questions[indexParent].content as BitmapQuestion).answerPoint
				.location[1]
		)
	};

	let initialLocation: MiddlewareLocation = {
		lat: String(
			($testObject.questions[indexParent].content as BitmapQuestion).initial
				.location[0]
		),
		lng: String(
			($testObject.questions[indexParent].content as BitmapQuestion).initial
				.location[1]
		)
	};

	function onZoomRangeInput(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (!e.currentTarget) return;
		leafletMap.setZoom(e.currentTarget.valueAsNumber ?? GEOGRAPHY_ZOOM_MIN);
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
			}
		);
	}

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
			const parsedLng = longitudeSchema.parse(Number(answerLocation.lng));
			content.answerPoint.location[1] = parsedLng;
		} catch (e) {
			answerLocation.lng = String(content.answerPoint.location[1]);
		}
		try {
			answerMarker.setLatLng(content.answerPoint.location);
			answerMarkerToleranceCircle.setLatLng(content.answerPoint.location);
		} catch (e) {}
	}

	$: {
		if (typeof content.tolerence === 'string' && content.tolerence !== '') {
			content.tolerence =
				Number(content.tolerence) ?? GEOGRAPHY_TOLERANCE_DEFAULT;
		}
	}

	$: answerMarkerToleranceCircle?.setRadius(content.tolerence * 1000);

	$: {
	}

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

		leafletMap = leaflet
			.map(mapEl, {
				crs: leaflet.CRS.Simple
			})
			.setView(content.initial.location, content.initial.zoom);

		leaflet.Marker.prototype.options.icon = DefaultIcon;

		// leafletMap = leaflet
		// 	.map(mapEl)
		// 	.setView(content.initial.location, content.initial.zoom);

		// let bounds = leaflet.latLngBounds(
		// 	leaflet.latLng(LATITUDE_MIN, LONGITUDE_MIN),
		// 	leaflet.latLng(LATITUDE_MAX, LONGITUDE_MAX)
		// );

		// leafletMap.setMaxBounds(bounds);
		leafletMap.setMinZoom(2);

		// leaflet
		// 	.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
		// 	.addTo(leafletMap);

		initialMarker = leaflet
			.marker(content.initial.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(leafletMap)
			.bindTooltip('Initial User View');

		answerMarker = leaflet
			.marker(content.answerPoint.location, {
				draggable: true,
				autoPan: true
			})
			.addTo(leafletMap)
			.bindTooltip('Marking answer position');

		answerMarkerToleranceCircle = leaflet
			.circle(content.answerPoint.location, {
				color: '#6433f0',
				fillColor: '#6433f035',
				fillOpacity: 0.5,
				radius: content.tolerence * 1000
			})
			.addTo(leafletMap);

		initialMarker.on('dragend', (e) => {
			const location = e.target.getLatLng() as {
				lat: number;
				lng: number;
			};
			initialLocation.lat = String(location.lat.toFixed(6));
			initialLocation.lng = String(location.lng.toFixed(6));
		});
		answerMarker.on('dragend', (e) => {
			const location = e.target.getLatLng() as {
				lat: number;
				lng: number;
			};
			answerLocation.lat = String(location.lat.toFixed(6));
			answerLocation.lng = String(location.lng.toFixed(6));
		});

		leafletMap.on('zoom', (e) => {
			content.initial.zoom = leafletMap.getZoom();
		});

		if (content.imageFile instanceof File) {
			const reader = new FileReader();
			reader.readAsDataURL(content.imageFile);
			reader.onload = () => {
				uploadedImageUrl = reader.result as string;
			};
		}
	});

	onDestroy(() => {
		leafletMap?.remove();
		answerMarker?.remove();
		initialMarker?.remove();
	});
</script>

<form class="relative flex flex-col gap-4">
	<ImageImportV2
		{onImageUpload}
		uploadedImageUrl={uploadedImageUrl || content?.imageUrl}
		allowedImageTypes={ALLOWED_IMAGE_TYPES}
		inputId={indexParent}
	/>
	<Collapsible title="Show options" openedTitle="Hide options">
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
					on:focusout={() => {
						if (
							initialLocation.lat === '' ||
							'' + content.initial.location[0] != initialLocation.lat
						) {
							initialLocation.lat = String(content.initial.location[0]);
						}
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
					on:focusout={() => {
						if (
							initialLocation.lng === '' ||
							'' + content.initial.location[1] != initialLocation.lng
						) {
							initialLocation.lng = String(content.initial.location[1]);
						}
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
					on:focusout={() => {
						if (
							answerLocation.lat === '' ||
							'' + content.answerPoint.location[0] != answerLocation.lat
						) {
							answerLocation.lat = String(content.initial.location[0]);
						}
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
					on:focusout={() => {
						if (
							answerLocation.lng === '' ||
							'' + content.answerPoint.location[1] != answerLocation.lng
						) {
							answerLocation.lng = String(content.initial.location[1]);
						}
					}}
				/>
			</ErrorEnhance>
		</div>
		<div>
			<div>
				<span class="text-body2">Answer Tolerance</span>
				<input
					type="range"
					min={GEOGRAPHY_TOLERANCE_MIN}
					max={GEOGRAPHY_TOLERANCE_MAX}
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
					min={GEOGRAPHY_ZOOM_MIN}
					max={GEOGRAPHY_ZOOM_MAX}
					bind:value={content.initial.zoom}
					class="range range-sm range-primary dark:range-accent"
					on:input={onZoomRangeInput}
				/>
			</div>
		</div>
	</Collapsible>
	<!-- Display the map -->
	<div class="w-full h-[300px] relative">
		<div bind:this={mapEl} class="absolute inset-0 z-[10]" />
	</div>
</form>
