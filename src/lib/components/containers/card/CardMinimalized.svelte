<script lang="ts">
	export let title: string;
	export let description: string;
	export let stars: number;
	export let views: number;
	export let author: string;
	export let authorImg: string | null = null;
</script>

<div
	class="group flex flex-col justify-between gap-2 text-center bg-light_quaternary
	 shadow-md max-w-[300px] text-light_text_black p-4 rounded-md mb-5 relative min-h-[180px]"
>
	<div>
		<span class="flex justify-end gap-1 mb-2 text-xs"
			>{author}
			{#if authorImg}<img src={authorImg} alt="User Icon" />{/if}</span
		>
		<h4
			class="mb-2 overflow-hidden font-semibold overflow-ellipsis whitespace-nowrap"
		>
			{title}
		</h4>
		<p class="max-w-[80%] mx-auto description">{description}</p>
		<div class="grid-icon">
			<iconify-icon icon="iconamoon:enter" class="overflow-hidden text-3xl" />
		</div>
	</div>
	<div class="flex justify-between">
		<div class="flex items-center gap-1">
			<span>{stars}</span>
			<iconify-icon icon="ic:round-star-outline" />
		</div>
		<div class="flex items-center gap-1">
			<iconify-icon icon="mdi:eye" />
			<span>{views}</span>
		</div>
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

	.grid-icon {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition: 200ms;
	}

	.group:hover .grid-icon {
		grid-template-rows: 1fr;
		opacity: 1;
	}
</style>
