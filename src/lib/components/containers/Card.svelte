<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';

	export let redirectLink: string = '#';
	export let imageLink: string = '/imgs/content_imgs/liska.avif';
	export let imageAlt: string = '';
	export let title: string;
	export let description: string;
	export let stars: number | undefined = undefined;
	export let tags: string[] = [];
</script>

<div
	class="flex flex-col justify-between w-full max-w-xs p-5 bg-white rounded-lg aspect-square card_bg shadow-surrounding"
>
	<div>
		<a href={redirectLink} class="relative block group">
			<div class="overflow-hidden rounded-lg">
				<img
					class="rounded-lg w-[100%] aspect-[3/2] object-cover group-hover:blur-md overflow-hidden duration-200"
					src={imageLink}
					alt={imageAlt}
				/>
			</div>
			<Icon
				icon="iconamoon:enter"
				class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] text-5xl text-white opacity-0 group-hover:opacity-100 duration-200"
			/>
		</a>
		<Space gap={10} />
		<h5
			class="overflow-hidden font-bold text-center uppercase text-body1 overflow-ellipsis whitespace-nowrap text-light_text_black"
		>
			{title}
		</h5>
		<Space gap={5} />
		<p
			class="overflow-hidden text-center text-body2 text-light_text_black_80 overflow-ellipsis line-clamp-2"
		>
			{description}
		</p>
		<Space gap={5} />
		<div class="flex items-center justify-between px-4">
			{#if stars}
				<span class="flex items-center gap-2"><Icon icon="ic:round-star-outline" /> {stars}</span>
			{/if}
			<!-- {#if views}
				<span class="flex items-center gap-2"
					><Icon icon="ic:outline-remove-red-eye" /> {views}</span
				>
			{/if} -->
		</div>
		<Space gap={5} />
	</div>
	<div class="flex gap-2">
		{#each tags as tag}
			<div class="px-2 py-1 text-white rounded-full bg-success text-body2">{tag}</div>
		{/each}
	</div>
</div>

<style>
	.card_bg {
		background-image: url('/imgs/svgs/card_bg.svg');
		/* box-shadow: 3px 1px 15px var(--light-text-black-40); */
	}
</style>
