<script lang="ts">
	import type { Group } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import {
		GROUP_NAME_MAX,
		GROUP_NAME_MIN,
		groupNameSchema
	} from '~schemas/textInput';

	export let groups: Group[];

	let openDialog: () => void;
</script>

<Dialog bind:open={openDialog} title={'Create a new group'}>
	<TextInputSimple
		title="Group name"
		titleName="groupName"
		max={GROUP_NAME_MAX}
		min={GROUP_NAME_MIN}
		validationSchema={groupNameSchema}
	/>
	<div class="flex flex-col gap-1">
		<span class="text-body2">Group photo</span>
		<button
			type="button"
			class="grid border-2 border-dashed rounded-md w-28 border-light_text_black_80 dark:border-dark_text_white_80 aspect-square place-content-center"
		>
			<iconify-icon icon="uil:plus" class="text-5xl" />
		</button>
	</div>
	<div class="flex flex-col gap-1" />
</Dialog>
<section>
	<h2 class="text-h4 text-light_text_black_80 dark:text-dark_text_white_80">
		Your groups
	</h2>
	<Separator
		w={'100%'}
		h={'2px'}
		color={$applicationStates['darkMode']
			? 'var(--dark-text-white-20)'
			: 'var(--light-text-black-20)'}
	/>
	<div class="min-h-[220px] py-4 px-2 grid place-content-center">
		{#if groups.length > 0}
			{#each groups as group}
				<div>
					<h3>{group.name}</h3>
				</div>
			{/each}
		{:else}
			<p
				class="font-semibold text-center text-h5 text-light_text_black_60 dark:text-dark_text_white_60"
			>
				You are not a member of any group YET.
			</p>
		{/if}
	</div>
	<Separator
		w={'100%'}
		h={'2px'}
		color={$applicationStates['darkMode']
			? 'var(--dark-text-white-20)'
			: 'var(--light-text-black-20)'}
	/>
	<div
		class="flex items-center gap-2 text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
	>
		<button class="hover:text-light_text_black dark:hover:text-dark_text_white"
			>Join group</button
		>|<button
			on:click={openDialog}
			class="hover:text-light_text_black dark:hover:text-dark_text_white"
			>Create group</button
		>
	</div>
</section>
