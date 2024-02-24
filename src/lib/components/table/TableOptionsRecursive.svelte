<script lang="ts" context="module">
	import type { CustomEventHandler } from 'bits-ui';

	export type ActionChoice = {
		label: string;
		onClick: (e: CustomEventHandler<MouseEvent, HTMLDivElement>) => void;
		subchoices?: ActionChoice[];
	};
</script>

<script lang="ts">
	import * as DropdownMenu from '~/lib/components/ui/dropdown-menu';

	export let choices: ActionChoice[];
</script>

<DropdownMenu.Sub>
	{#each choices as { label, onClick, subchoices }}
		{#if subchoices && subchoices?.length > 0}
			<DropdownMenu.SubTrigger on:click={(e) => onClick(e)}
				>{label}</DropdownMenu.SubTrigger
			>
			<DropdownMenu.SubContent>
				<svelte:self choices={subchoices} />
			</DropdownMenu.SubContent>
		{:else}
			<DropdownMenu.Item on:click={(e) => onClick(e)}>{label}</DropdownMenu.Item
			>
		{/if}
	{/each}
</DropdownMenu.Sub>
