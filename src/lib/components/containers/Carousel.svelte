<script lang="ts">
	export let data: {
		title: string;
		description?: string;
		img?: string;
	}[];
</script>

<section class="@container relative flex gap-2 overflow-hidden flex-nowrap">
	{#each data as item}
		<div class="@2xl:min-w-[25%] @6xl:min-w-[20%] relative aspect-[3/4]">
			<div class="w-full max-w-[300px] bg-white h-full shadow rounded-md">
				<h3>{item.title}</h3>
				<!-- {#if item.description}
          <p>{item.description}</p>
          {/if} -->
				{#if item.img}
					<img src={item.img} alt={item.title} />
				{/if}
			</div>
		</div>
	{/each}
</section>
