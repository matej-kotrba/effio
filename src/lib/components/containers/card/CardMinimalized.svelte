<script lang="ts">
	import type { Tag } from '@prisma/client';

	export let title: string;
	export let description: string;
	export let stars: number;
	export let views: number;
	export let author: string;
	export let authorImg: string | null = null;
	export let tags: Tag[] = [];
</script>

<div
	class="group flex flex-col justify-between gap-2 text-center bg-light_quaternary dark:bg-dark_quaternary cursor-pointer
	 shadow-md w-full max-w-[300px] text-light_text_black dark:text-dark_text_white p-2 rounded-md relative min-h-[180px] overflow-hidden
	 hover:scale-105 hover:shadow-lg duration-150"
>
	<div>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-1">
				<span>{stars}</span>
				<iconify-icon icon="ic:round-star-outline" />
			</div>
			<span class="flex items-center justify-end gap-1 mb-2 text-xs"
				>{author}
				{#if authorImg}<img
						src={authorImg}
						referrerpolicy="no-referrer"
						alt="User Icon"
						class="w-6 rounded-full"
					/>{/if}</span
			>
		</div>
		<h4
			class="mb-2 overflow-hidden font-semibold overflow-ellipsis whitespace-nowrap"
		>
			{title}
		</h4>
		<p class="max-w-[80%] mx-auto description">{description}</p>
	</div>
	<div class="flex items-center justify-center">
		<span class="text-xs">{tags.map((tag) => tag.name).join(' | ')}</span>

		<!-- <div class="flex items-center gap-1">
			<iconify-icon icon="mdi:eye" />
			<span>{views}</span>
		</div> -->
	</div>
</div>

<style>
	.description {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;

		@apply text-sm;
		line-height: 1.5em;
		height: 3em;
	}

	.group::after {
		content: '';
		width: 12px;
		height: 300%;
		rotate: 45deg;
		left: -100%;
		top: -100%;
		transform: translateY(-50%) translateX(-0%);
		background-color: white;
		filter: blur(8px);
		position: absolute;
		pointer-events: none;
	}

	:global(.dark) .group::after {
		background-color: var(--dark-text-white-60);
	}

	.group:hover::after {
		animation: slide 0.6s linear forwards;
	}
	@keyframes slide {
		from {
			left: -100%;
			top: -100%;
		}
		to {
			left: 100%;
			top: 100%;
		}
	}
</style>
