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
	class="w-full h-full p-2 border rounded-lg border-light_text_black_20 bg-light_grey dark:bg-dark_grey dark:border-dark_text_white_20 grid grid-rows-[auto_auto_1fr_auto]"
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

	<h5 class="mt-1 break-words line-clamp-2">
		{data.name}
	</h5>
	<div class="w-full h-full" />
	<div class="flex justify-between">
		<span class="self-end text-body2"
			>{transformDate(data.addedAt, { time: true })}</span
		>
		<Tooltip.Root openDelay={300}>
			<Tooltip.Trigger class="self-end">
				<div>
					<span class="self-end font-semibold">{data.doneBy}</span>
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
