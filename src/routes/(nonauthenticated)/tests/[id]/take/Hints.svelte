<script lang="ts">
	export let isHintShowed = false;
	export let hints: string[];
	export let hintIndex: number = 0;
</script>

<div>
	{#if !isHintShowed}
		<button
			class="btn btn-outline hover:bg-light_terciary btn-sm"
			type="button"
			on:click={() => (isHintShowed = true)}
		>
			Show hints <iconify-icon icon="tabler:bulb-filled" class="text-xl" />
		</button>
	{:else}
		<div class="flex gap-1">
			<button
				type="button"
				class="grid p-2 duration-100 border-2 border-solid rounded-full border-light_text_black place-content-center hover:bg-light_grey_dark group disabled:border-light_text_black_60 dark:disabled:border-dark_text_white_60 dark:border-dark_text_white"
				disabled={hintIndex === 0}
				on:click={() => {
					if (hintIndex > 0) {
						hintIndex--;
					}
				}}
			>
				<iconify-icon
					icon="bxs:left-arrow"
					class="text-sm group-disabled:text-light_text_black_60 dark:group-disabled:text-dark_text_white_60"
				/>
			</button>
			<button
				type="button"
				class="grid p-2 duration-100 border-2 border-solid rounded-full border-light_text_black place-content-center hover:bg-light_grey_dark group disabled:border-light_text_black_60 dark:disabled:border-dark_text_white_60 dark:border-dark_text_white"
				disabled={hintIndex === hints.length - 1}
				on:click={() => {
					if (hintIndex < hints.length - 1) {
						hintIndex++;
					}
				}}
			>
				<iconify-icon
					icon="bxs:right-arrow"
					class="text-sm group-disabled:text-light_text_black_60 dark:group-disabled:text-dark_text_white_60"
				/>
			</button>
		</div>
		{#key hints[hintIndex]}
			<span class="">
				{hints[hintIndex]}
			</span>
		{/key}
	{/if}
</div>
