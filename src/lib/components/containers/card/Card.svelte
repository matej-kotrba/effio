<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import DropdownSelect from '~components/collapsibles/DropdownSelect.svelte';
	import { onImageLoad } from '~use/onImageLoad';
	import { applicationStates } from '~stores/applicationStates';
	import type { Tag } from '@prisma/client';
	import TagContainer from '~components/buttons/Tag.svelte';

	export let redirectLink: string = '#';
	export let imageLink: string = ''; //'/imgs/content_imgs/liska.avif';
	export let imageAlt: string = '';
	export let title: string;
	export let description: string;
	export let stars: number | undefined = undefined;
	export let tags: Tag[] = [];
	export let dropdownTabs: {
		iconClass?: string;
		text: string;
		action: (e: MouseEvent) => void;
	}[] = [];
	export let createdAt: Date | undefined = undefined;

	let isImageFallback = false;
</script>

<div
	class="flex flex-col justify-between w-full p-3 bg-white dark:bg-dark_light_grey rounded-lg card_bg shadow-surrounding aspect-[3/4] max-w-[280px]"
>
	<div>
		<a href={redirectLink} class="relative block group">
			<div class="relative overflow-hidden rounded-lg image-container">
				{#if imageLink}
					<img
						class="rounded-lg w-[100%] aspect-[3/2] object-cover group-hover:blur-md overflow-hidden duration-200"
						src={isImageFallback
							? $applicationStates['darkMode']['isDarkMode']
								? '/imgs/content_imgs/poly_dark.png'
								: '/imgs/content_imgs/poly.png'
							: imageLink || '/imgs/effio/text.png'}
						alt={imageAlt}
						use:onImageLoad
						on:imageerror={(e) => {
							isImageFallback = true;
							// e.target.src = '/imgs/svgs/user-circle.svg';
						}}
					/>
				{:else}
					<div
						class="rounded-lg w-[100%] aspect-[3/2] group-hover:blur-md overflow-hidden duration-200
						grid place-content-center bg-zinc-200 title-placeholder-container"
					>
						<!-- -rotate-[12deg] -->
						<div
							class="font-bold text-center text-transparent text-h5 title-placeholder"
							data-text={title}
						>
							{title}
						</div>
					</div>
				{/if}
				<!-- Display the time when the test was created -->
				<div
					class="absolute bottom-0 pt-1 pl-2 pr-1 rounded-br-md rounded-tl-md text-light_white right-0 z-[2] date group-hover:blur-md duration-100"
				>
					<p class="text-body2">
						{typeof createdAt !== 'undefined'
							? `${createdAt.getDate()}. ${
									createdAt.getMonth() + 1
							  }. ${createdAt.getFullYear()}`
							: ''}
					</p>
				</div>
			</div>
			<iconify-icon
				icon="iconamoon:enter"
				class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] text-5xl text-white opacity-0 group-hover:opacity-100 duration-200"
			/>
		</a>
		<Space gap={10} />
		<h5
			class="overflow-hidden font-bold text-center uppercase text-body1 overflow-ellipsis whitespace-nowrap text-light_text_black dark:text-dark_text_white"
		>
			{title}
		</h5>
		<Space gap={5} />
		<p
			class="overflow-hidden text-center text-body2 text-light_text_black dark:text-dark_text_white_80 overflow-ellipsis line-clamp-2"
		>
			{description}
		</p>
	</div>
	<div class="flex gap-2 py-1 overflow-x-auto">
		{#each tags as tag}
			<TagContainer {tag} />
		{/each}
	</div>
	<div class="flex items-center justify-between">
		{#if stars !== undefined}
			<span
				class="flex items-center gap-2 text-light_text_black dark:text-dark_text_white"
				><iconify-icon
					icon="ic:round-star-outline"
					class="text-3xl duration-100 hover:text-yellow-400"
				/>
				{stars}</span
			>
		{/if}

		<DropdownSelect {dropdownTabs}>
			<iconify-icon
				icon="fluent:settings-24-filled"
				class="text-3xl text-light_text_black dark:text-dark_text_white"
			/>
		</DropdownSelect>
	</div>
</div>

<style>
	.card_bg {
		/* background-image: url('/imgs/svgs/card_bg.svg'); */
		/* box-shadow: 3px 1px 15px var(--light-text-black-40); */
	}

	.image-container::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.date {
		background-color: rgba(0, 0, 0, 0.15);
		box-shadow: 0 0 15px 0px rgba(0, 0, 0, 0.15);
	}

	.title-placeholder-container {
		background-image: url('/imgs/content_imgs/poly.png');
		background-size: cover;
		background-position: center;
		box-shadow: 0 0 10px 0px black;
	}

	:global(.dark) .title-placeholder-container {
		background-image: url('/imgs/content_imgs/poly_dark.png');
	}

	/* .title-placeholder {
		color: white;
		text-shadow: 0 0 10px var(--light-text-black-40);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		position: relative;
	} */

	/* .title-placeholder::before {
		content: attr(data-text);
		position: absolute;
		left: -2px;
		top: -2px;
		width: 100%;
		height: 100%;
		color: var(--light-whiter);
	} */

	@keyframes rotate-settings {
		from {
			rotate: 0;
		}
		to {
			rotate: 60deg;
		}
	}
</style>
