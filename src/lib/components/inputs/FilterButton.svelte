<script lang="ts">
	export let options: {
		value: string;
	}[];
</script>

<div class="flex items-center gap-1">
	<iconify-icon icon="heroicons-solid:filter" class="text-3xl" />
	<select class="w-full max-w-xs select dark:bg-dark_light_grey">
		{#each options as option, index}
			<option selected={index === 0}>{option.value}</option>
		{/each}
	</select>
</div>
