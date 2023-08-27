<script lang="ts">
	export let options: {
		value: string;
	}[];

	export let selectRef: HTMLSelectElement | null = null;
</script>

<div class="flex items-center gap-1">
	<select
		bind:this={selectRef}
		class="w-full max-w-xs shadow-lg select dark:bg-dark_light_grey"
		on:change={() => (selectRef = selectRef)}
	>
		{#each options as option, index}
			<option
				value={option.value.toLowerCase().replace(/\s/g, '')}
				selected={index === 0}>{option.value}</option
			>
		{/each}
	</select>
	<iconify-icon icon="ic:round-sort" class="text-3xl" />
</div>
