<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import { transformDate } from '~utils/date';

	export let test: {
		title: string;
		description: string;
		imageUrl?: string;
		createdAt?: Date;
	};

	let isFallback = false;

	export let url: string;
</script>

<div>
	{#if test.createdAt}
		<div class="overflow-hidden text-body2 text-ellipsis whitespace-nowrap">
			<span class="text-light_text_black_60 dark:text-dark_text_white_60"
				>Added at:</span
			>
			<span class="text-light_text_black_80 dark:text-dark_text_white_80"
				>{transformDate(test.createdAt, { time: true })}</span
			>
		</div>
	{/if}
	<div
		class="flex flex-col overflow-hidden border rounded-md border-light_text_black_20 dark:border-dark_text_white_20"
	>
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
			class="px-2 py-1 text-center bg-light_grey dark:bg-dark_grey text-body2 rounded-b-md"
		>
			<span class="w-full overflow-ellipsis line-clamp-1"
				><abbr title={test.title} class="no-underline">{test.title}</abbr></span
			>
		</div>
	</div>
</div>
