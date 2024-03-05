<script lang="ts">
	export let isHintShowed = false;
	export let hints: string[];
	export let hintIndex: number = 0;
</script>

<div class="flex items-end justify-between">
	<h4>Hints</h4>
	<div class="text-body2">
		<span>{hintIndex + 1}</span>
		<span class="text-light_text_black_40">/</span>
		<span>{hints.length}</span>
	</div>
</div>
{#if hints.length === 0}
	No hint provided
{:else}
	<div
		class="grid items-center py-1 border rounded-lg border-light_text_black_40 bg-light_whiter grid__container"
	>
		<button
			type="button"
			class="grid duration-100 group disabled:hover:px-0 hover:pl-4 place-content-center"
			disabled={hintIndex === 0}
			on:click={() => {
				if (hintIndex > 0) {
					hintIndex--;
				}
			}}
		>
			<iconify-icon
				icon="iconamoon:arrow-left-2-light"
				class="text-2xl text-light_text_black group-disabled:text-light_text_black_40"
			/>
		</button>
		<span>
			{hints[hintIndex]}
		</span>
		<button
			type="button"
			class="grid duration-100 group disabled:hover:px-0 hover:pr-4 place-content-center"
			disabled={hintIndex === hints.length - 1}
			on:click={() => {
				if (hintIndex < hints.length - 1) {
					hintIndex++;
				}
			}}
		>
			<iconify-icon
				icon="iconamoon:arrow-right-2-light"
				class="text-2xl text-light_text_black group-disabled:text-light_text_black_40"
			/>
		</button>
	</div>
{/if}

<!-- {#if hints.length !== 0}
	<div>
		{#if !isHintShowed}
			<button
				class="btn btn-outline dark:border-dark_text_white dark:text-dark_text_white dark:hover:bg-dark_terciary hover:bg-light_terciary btn-sm"
				type="button"
				on:click={() => (isHintShowed = true)}
			>
				Show hints <iconify-icon icon="tabler:bulb-filled" class="text-xl" />
			</button>
		{:else}
			<div class="flex gap-1">
				<button
					type="button"
					class="grid p-2 duration-100 border-2 border-solid rounded-full border-light_text_black place-content-center hover:bg-light_grey_dark dark:hover:bg-dark_text_white_20 group disabled:border-light_text_black_60 dark:disabled:border-dark_text_white_60 dark:border-dark_text_white"
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
					class="grid p-2 duration-100 border-2 border-solid rounded-full border-light_text_black place-content-center hover:bg-light_grey_dark dark:hover:bg-dark_text_white_20 group disabled:border-light_text_black_60 dark:disabled:border-dark_text_white_60 dark:border-dark_text_white"
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
{/if} -->

<style>
	.grid__container {
		grid-template-columns: auto 1fr auto;
	}
</style>
