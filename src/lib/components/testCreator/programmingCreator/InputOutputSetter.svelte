<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';

	// export let testObjectReference:
	export let title = '';

	const SUPPORTED_TYPES = [
		'string',
		'number',
		'boolean',
		'array',
		'object'
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

<div>
	<h6>{title}</h6>
	<div class="w-fit">
		<select
			class="w-full h-full max-w-xs select select-bordered"
			on:change={(e) => onSelectChange(e)}
		>
			<option disabled selected>Select</option>
			{#each SUPPORTED_TYPES as type}
				<option class="font-semibold capitalize">{type}</option>
			{/each}
			<div class="w-full">
				<TextInputSimple
					title="Input"
					titleName="input"
					displayOutside={true}
					on:error={(event) =>
						($testObject.questions[INDEX_OF_QUESTION]['errors']['title'] =
							event.detail)}
					bind:inputValue={$testObject.questions[INDEX_OF_QUESTION]['title']}
				/>
			</div>
		</select>
	</div>
</div>
