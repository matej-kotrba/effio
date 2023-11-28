<script lang="ts">
	const SUPPORTED_TYPES = [
		'string',
		'number',
		'boolean',
		'array',
		'object',
		'undefined',
		'null'
	] as const;

	export let selectedType: (typeof SUPPORTED_TYPES)[number] | undefined =
		undefined;

	function onSelectChange(
		e: Event & {
			currentTarget: EventTarget & HTMLSelectElement;
		}
	) {
		selectedType = e.currentTarget.value as (typeof SUPPORTED_TYPES)[number];
	}
</script>

<select
	class="w-full max-w-xs select select-bordered"
	on:change={(e) => onSelectChange(e)}
>
	<option disabled selected class="grid place-content-center">Select</option>
	{#each SUPPORTED_TYPES as type}
		<option class="font-semibold capitalize">{type}</option>
	{/each}
	<div class="w-full">
		{#if selectedType === 'string'}{/if}
	</div>
</select>
