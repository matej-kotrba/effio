<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import { onImageLoad } from '~use/onImageLoad';
	import { transformDate } from '~utils/date';
	import * as Tooltip from '~components/ui/tooltip/index';

	type Data = {
		name: string;
		addedAt: Date;
		imageUrl: string | undefined;
		doneBy: number;
		totalNumberOfUsers: number;
		link: string;
	};

	export let data: Data;

	let isFallback = false;
</script>

<div
	class="w-full p-2 border rounded-lg border-light_text_black_20 bg-light_grey dark:bg-dark_grey dark:border-dark_text_white_20"
>
	<a
		href={data.link}
		class="relative block w-full overflow-hidden rounded-lg aspect-video group mask-effect"
	>
		<img
			class="object-cover w-full h-full duration-150 group-hover:scale-110"
			src={isFallback
				? $applicationStates['darkMode']['isDarkMode']
					? '/imgs/content_imgs/poly_dark.png'
					: '/imgs/content_imgs/poly.png'
				: data.imageUrl
				? data.imageUrl
				: $applicationStates['darkMode']['isDarkMode']
				? '/imgs/content_imgs/poly_dark.png'
				: '/imgs/content_imgs/poly.png'}
			alt=""
			width="240"
			loading="lazy"
			use:onImageLoad
			on:imageerror={(e) => {
				isFallback = true;
			}}
		/>
	</a>

	<div class="flex justify-between">
		<div class="mt-1">
			<h5 class="leading-4">{data.name}</h5>
			<span class="text-body2"
				>{transformDate(data.addedAt, { time: true })}</span
			>
		</div>
		<Tooltip.Root openDelay={300}>
			<Tooltip.Trigger class="self-end">
				<div>
					<span class="font-semibold">{data.doneBy}</span>
					<span> / </span><span class="font-semibold"
						>{data.totalNumberOfUsers}</span
					>
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content>
				Done by <span class="font-semibold">x</span> out of
				<span class="font-semibold">y</span> users
			</Tooltip.Content>
		</Tooltip.Root>
	</div>
</div>

<style>
	.mask-effect::after {
		content: '';
		position: absolute;
		inset: 0;
		background: transparent;
		mask-image: radial-gradient(circle at center, transparent 40%, black);
		background-color: var(--light-grey);
	}

	:global(.dark) .mask-effect::after {
		background-color: var(--dark_grey);
	}
</style>
