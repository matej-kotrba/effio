<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';

	export let redirectLink: string = '#';
	export let imageLink: string = ''; //'/imgs/content_imgs/liska.avif';
	export let imageAlt: string = '';
	export let title: string;
	export let description: string;
	export let stars: number | undefined = undefined;
	export let tags: string[] = [];
</script>

<div
	class="flex flex-col justify-between w-full max-w-xs p-5 bg-white rounded-lg card_bg shadow-surrounding aspect-[3/4]"
>
	<div>
		<a href={redirectLink} class="relative block group">
			<div class="overflow-hidden rounded-lg">
				{#if imageLink}
					<img
						class="rounded-lg w-[100%] aspect-[3/2] object-cover group-hover:blur-md overflow-hidden duration-200"
						src={imageLink}
						alt={imageAlt}
					/>
				{:else}
					<div
						class="rounded-lg w-[100%] aspect-[3/2] group-hover:blur-md overflow-hidden duration-200
						grid place-content-center bg-zinc-200 title-placeholder-container"
					>
						<div
							class="-rotate-[12deg] text-transparent font-bold text-h4 title-placeholder"
							data-text={title}
						>
							{title}
						</div>
					</div>
				{/if}
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
	</div>
	<div class="flex gap-2">
		{#each tags as tag}
			<div class="px-2 py-1 text-white rounded-full bg-success text-body2">{tag}</div>
		{/each}
	</div>
	<div class="flex items-center justify-between">
		{#if stars !== undefined}
			<span class="flex items-center gap-2 text-light_text_black"
				><Icon
					icon="ic:round-star-outline"
					class="text-3xl duration-100 hover:text-yellow-400"
				/>{stars}</span
			>
		{/if}
		<button type="button" class="settings-button">
			<Icon icon="fluent:settings-24-filled" class="text-3xl text-light_text_black" />
		</button>
	</div>
</div>

<style>
	.card_bg {
		/* background-image: url('/imgs/svgs/card_bg.svg'); */
		/* box-shadow: 3px 1px 15px var(--light-text-black-40); */
	}

	.title-placeholder-container {
		background-image: url('/imgs/svgs/test-bg-placeholder.svg');
		background-size: cover;
		background-position: center;
		box-shadow: 0 0 10px 0px black;
	}

	.title-placeholder {
		-webkit-text-stroke: 1px black;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		position: relative;
	}

	.title-placeholder::before {
		content: attr(data-text);
		position: absolute;
		left: -2px;
		top: -2px;
		width: 100%;
		height: 100%;
		color: var(--light-whiter);
	}

	.settings-button:hover {
		animation: rotate-settings 0.2s ease-in-out forwards;
	}

	@keyframes rotate-settings {
		from {
			rotate: 0;
		}
		to {
			rotate: 60deg;
		}
	}
</style>