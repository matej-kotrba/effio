<script lang="ts">
	export let isHintShowed = true;
	export let hints: string[];
	export let hintIndex: number = 0;

	$: console.log(hints)
</script>

<div>
	{#if !isHintShowed}
		<button
			class="btn btn-outline hover:bg-light_terciary btn-sm"
			type="button"
			on:click={() => (isHintShowed = true)}
		>
			Show hints
		</button>
	{:else}
		<div class="flex gap-1">
			<button
				type="button"
				class="grid p-2 duration-100 border-2 border-solid rounded-full border-light_text_black place-content-center hover:bg-light_grey_dark"
				on:click={() => {
					if (hintIndex > 0) {
						hintIndex--;
					}
				}}
			>
				<iconify-icon icon="bxs:left-arrow" class="text-sm" />
			</button>
			<button
				type="button"
				class="grid p-2 duration-100 border-2 border-solid rounded-full border-light_text_black place-content-center hover:bg-light_grey_dark"
				on:click={() => {
					if (hintIndex < hints.length - 1) {
						hintIndex++;
					}
				}}
			>
				<iconify-icon icon="bxs:right-arrow" class="text-sm" />
			</button>
		</div>
		{#key hints[hintIndex]}
			<span class="">
				{hints[hintIndex]}
			</span>
		{/key}
	{/if}
</div>
