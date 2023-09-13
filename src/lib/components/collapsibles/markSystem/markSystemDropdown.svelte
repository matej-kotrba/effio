<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';
	import Collapsible from '../Collapsible.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import { MARK_LIMIT_MAX } from '~schemas/textInput';

	export let markSystem: MarkSystemJSON['marks'];
</script>

<Collapsible position="left" title="Show marking">
	<div class="grid__layout">
		<p
			class="font-semibold text-center text-light_text_black_60 dark:text-dark_text_white_60"
		>
			Grade
		</p>
		<Separator
			w="100%"
			h="100%"
			class="mb-6"
			color={$applicationStates.darkMode
				? 'var(--dark-text-white-20)'
				: 'var(--light-text-black-20)'}
		/>
		<p
			class="font-semibold text-center text-light_text_black_60 dark:text-dark_text_white_60"
		>
			Range
		</p>
		<div class="col-span-3 mb-3" />
		{#each markSystem as mark, index}
			{#if mark['name'] !== undefined && mark['limit'] !== undefined}
				{#if index === 0}
					<p class="text-center">
						{mark['name']}
					</p>
					<div />
					<p class="text-center">
						{MARK_LIMIT_MAX}% - {mark['limit']}%
					</p>
				{/if}
				{#if markSystem[index - 1]?.limit !== undefined}
					<p class="text-center">
						{mark['name']}
					</p>
					<div />
					<p class="text-center">
						{markSystem[index - 1]['limit'] || 1 - 1}% - {mark['limit']}%
					</p>
				{/if}
			{/if}
		{/each}
	</div>
</Collapsible>
