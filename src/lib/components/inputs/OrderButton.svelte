<script lang="ts">
	export let options: {
		value: string;
	}[];

	export let selectValue: string | null = null;
</script>

<div class="flex items-center gap-1">
	<select
		bind:value={selectValue}
		class="w-full max-w-xs shadow-lg select dark:bg-dark_light_grey"
	>
		{#each options as option, index}
			<option selected={index === 0}>{option.value}</option>
		{/each}
	</select>
	<iconify-icon icon="ic:round-sort" class="text-3xl" />
</div>
