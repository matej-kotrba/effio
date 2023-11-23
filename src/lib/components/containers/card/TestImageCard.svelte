<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';

	export let test: {
		title: string;
		description: string;
		imageUrl?: string;
	};

	let isFallback = false;

	export let url: string;
</script>

<div class="flex flex-col overflow-hidden rounded-md shadow-md">
	<a
		href={url}
		class="relative w-full overflow-hidden aspect-video text-body2 group
							before:content-[''] before:z-[1] before:w-full before:h-full before:bg-[#00000045] before:opacity-0
							hover:before:opacity-100 before:absolute before:left-0 before:top-0 before:duration-150"
	>
		<img
			src={test.imageUrl
				? test.imageUrl
				: $applicationStates.darkMode.isDarkMode
				? '/imgs/content_imgs/poly_dark.png'
				: '/imgs/content_imgs/poly.png'}
			alt="Test"
			class="object-cover w-full h-full duration-200 group-hover:blur-md group-hover:scale-110"
		/>
		<div
			class="z-[2] absolute left-0 w-full h-full p-2 duration-150 -bottom-full
								group-hover:bottom-0 text-white opacity-0 group-hover:opacity-100
								grid place-content-center text-center"
		>
			<p class="line-clamp-3">
				{test.description}
			</p>
		</div>
	</a>
	<div
		class="px-2 py-1 text-center bg-light_secondary dark:bg-dark_terciary text-body2 rounded-b-md"
	>
		<span class="w-full text-light_whiter overflow-ellipsis line-clamp-1"
			><abbr title={test.title} class="no-underline">{test.title}</abbr></span
		>
	</div>
</div>
