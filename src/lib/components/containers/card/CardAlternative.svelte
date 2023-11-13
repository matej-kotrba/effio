<script lang="ts" context="module">
	export type CardAlternativeProps = {
		title: string;
		description?: string;
		img?: string | null;
		icon?: string | null;
		createdAt?: Date;
		stars?: number;
	};
</script>

<script lang="ts">
	import { transformDate } from '~/lib/utils/date';

	import Star from '~components/globals/Star.svelte';

	export let data: CardAlternativeProps;
</script>

<div class="px-1 w-full max-w-[300px] aspect-[4/5]">
	<div class="h-full rounded-md shadow-lg bg-light_whiter">
		<div
			class="relative w-full aspect-video before:content-[''] before:w-full before:h-1 before:bg-light_secondary before:left-0 before:bottom-0 before:translate-y-1/2 before:absolute
					"
		>
			<div>
				{#if data.stars !== undefined}
					<div
						class="absolute flex items-center gap-1 px-2 py-1 rounded-lg right-1 top-1 bg-light_white"
					>
						<span class="text-light_text_black text-body2">
							{data.stars}
						</span>
						<Star />
					</div>
				{/if}
				<img
					src={data.icon ?? '/imgs/content_imgs/liska.avif'}
					alt="User Icon"
					class="absolute object-cover w-12 -translate-x-1/2 -translate-y-1/2 border-4 border-solid rounded-full aspect-square top-full left-1/2 border-light_secondary"
				/>
			</div>
			<img
				src={'/imgs/content_imgs/liska.avif'}
				alt={data.title}
				class="object-cover w-full h-full rounded-t-md"
			/>
		</div>
		<div class="p-2 mt-3">
			<abbr title={data.title} class="no-underline">
				<h3
					class="w-full overflow-hidden font-semibold text-center text-h6 overflow-ellipsis whitespace-nowrap"
				>
					{data.title}
				</h3>
			</abbr>
			{#if data.createdAt}
				<span class="block text-center text-body2 text-light_text_black_80"
					>{transformDate(data.createdAt, { time: true })}</span
				>
			{/if}
			{#if data.description}
				<div
					class="mt-2 text-center break-all line-clamp-3 text-body2 text-over"
				>
					{data.description}
				</div>
			{/if}
		</div>
	</div>
</div>
