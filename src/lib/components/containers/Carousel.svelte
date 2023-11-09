<script lang="ts">
	import { transformDate } from '~/lib/utils/date';
	import IconButton from '~components/buttons/IconButton.svelte';

	export let data: {
		title: string;
		description?: string;
		img?: string;
		icon?: string;
		createdAt?: Date;
	}[];

	let scrollerDiv: HTMLDivElement;

	function scrollLeft() {
		const oldValue = scrollerDiv.style.getPropertyValue('--translate-x');
		console.log(oldValue);
		scrollerDiv.style.setProperty(
			'--translate-x',
			`calc(${oldValue} + 100%/6)`
		);
	}
	function scrollRight() {
		const oldValue = scrollerDiv.style.getPropertyValue('--translate-x');
		scrollerDiv.style.setProperty(
			'--translate-x',
			`calc(${oldValue} - 100%/6)`
		);
	}
</script>

<section class="w-full">
	<div class="flex gap-2">
		<IconButton
			icon="ic:round-arrow-left"
			tootlip="Slide left"
			containerClasses="ml-auto dropdown-top dropdown-left border-2 border-solid border-light_text_black"
			tooltipClasses="bg-light_whiter rounded-md"
			onClick={scrollLeft}
		>
			<iconify-icon icon="ic:round-arrow-left" class="text-3xl" />
		</IconButton>
		<IconButton
			icon="ic:round-arrow-right"
			tootlip="Slide right"
			containerClasses="dropdown-top dropdown-left border-2 border-solid border-light_text_black"
			tooltipClasses="bg-light_whiter rounded-md"
			onClick={scrollRight}
		>
			<iconify-icon icon="ic:round-arrow-right" class="text-3xl" />
		</IconButton>
	</div>
	<div class="w-full overflow-hidden">
		<div
			bind:this={scrollerDiv}
			class="@container scroller flex flex-nowrap py-1 w-full translate-x-[calc(-100%/6)]"
			style="--translate-x: 0%;"
		>
			{#each data as item}
				<div
					class="@xl:min-w-[25%] @4xl:min-w-[20%] @7xl:min-w-[calc(100%/6)] relative aspect-[4/5]"
				>
					<div class="px-1 w-full max-w-[300px] aspect-[4/5]">
						<div class="h-full rounded-md shadow-lg bg-light_whiter">
							<div
								class="relative w-full aspect-video before:content-[''] before:w-full before:h-1 before:bg-light_secondary before:left-0 before:bottom-0 before:translate-y-1/2 before:absolute
        "
							>
								<div>
									<img
										src={item.icon ?? '/imgs/content_imgs/liska.avif'}
										alt="User Icon"
										class="absolute object-cover w-12 -translate-x-1/2 -translate-y-1/2 border-4 border-solid rounded-full aspect-square top-full left-1/2 border-light_secondary"
									/>
								</div>
								<img
									src={'/imgs/content_imgs/liska.avif'}
									alt={item.title}
									class="object-cover w-full h-full rounded-t-lg"
								/>
							</div>
							<div class="p-2 mt-3">
								<abbr title={item.title} class="no-underline">
									<h3
										class="w-full overflow-hidden font-semibold text-center text-h6 overflow-ellipsis whitespace-nowrap"
									>
										{item.title}
									</h3>
								</abbr>
								{#if item.createdAt}
									<span
										class="block text-center text-body2 text-light_text_black_80"
										>{transformDate(item.createdAt, { time: true })}</span
									>
								{/if}
								{#if item.description}
									<div class="mt-2 text-center line-clamp-3 text-body2">
										{item.description}
									</div>
								{/if}
							</div>
							<!-- {#if item.description}
              <p>{item.description}</p>
              {/if} -->
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.scroller {
		transform: translateX(var(--translate-x));
		transition: transform 0.3s ease-in-out;
	}
</style>
