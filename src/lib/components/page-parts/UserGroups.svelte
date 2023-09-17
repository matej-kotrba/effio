<script lang="ts">
	import type { Group } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import { applicationStates } from '~stores/applicationStates';

	export let groups: Group[];

	let openDialog: () => void;
	let openDialogJoin: () => void;
	export let closeDialog: () => void = () => {};
	export let closeDialogJoin: () => void = () => {};
</script>

<Dialog
	bind:open={openDialog}
	bind:close={closeDialog}
	title={'Create a new group'}
>
	<slot name="create" />
</Dialog>
<Dialog
	bind:open={openDialogJoin}
	bind:close={closeDialogJoin}
	title={'Join a group'}
>
	<slot name="join" />
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
		<button
			type="button"
			on:click={openDialogJoin}
			class="hover:text-light_text_black dark:hover:text-dark_text_white"
			>Join group</button
		>|<button
			type="button"
			on:click={openDialog}
			class="hover:text-light_text_black dark:hover:text-dark_text_white"
			>Create group</button
		>
	</div>
</section>
