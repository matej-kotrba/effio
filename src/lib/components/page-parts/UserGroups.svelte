<script lang="ts">
	import type { Group } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
	import { applicationStates } from '~stores/applicationStates';

	export let groups: Group[];

	export let isSubmitting = false;

	let openDialog: () => void;
	let openDialogJoin: () => void;

	export let closeDialog: () => void = () => {};
	export let closeDialogJoin: () => void = () => {};
</script>

<Dialog
	bind:open={openDialog}
	bind:close={closeDialog}
	title={'Create a new group'}
	{isSubmitting}
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
	<div class="min-h-[220px] py-4 px-2 grid">
		{#if groups.length > 0}
			<div
				class="grid w-full grid-cols-2 gap-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:max-w-[1200px]"
			>
				{#each groups as group}
					<a href="/dashboard/my-groups/{group.slug}" class="group-container">
						<div
							class="relative grid w-full rounded-md shadow-md group-item bg-light_whiter dark:bg-dark_grey aspect-square place-content-center"
						>
							<img
								src={group.imageUrl || '/imgs/logo_original.png'}
								alt=""
								class="w-[50%] aspect-square object-cover mx-auto rounded-sm"
							/>
							<Space gap={10} />
							<h3 class="text-center text-body2">{group.name}</h3>
						</div>
					</a>
				{/each}
			</div>
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

<style>
	:root {
		--group-translate: 15deg;
	}

	.group-container {
		perspective: 1000px;
	}

	.group-item {
		transition: 250ms;
		transform-style: preserve-3d;
	}

	.group-item::before {
		content: '';
		inset: 80% 15px 15px 15px;
		background-color: var(--light-primary);
		position: absolute;
		filter: blur(1rem);
		opacity: 0.4;
		transform: translateZ(-70px);
	}

	:global(.dark) .group-item::before {
		background-color: var(--dark-primary);
	}

	.group-item:hover {
		transform: rotateX(var(--group-translate));
	}

	.group-item > img {
		translate: 0 0 15px;
		transform: 0deg;
		transition: 250ms;
	}

	.group-item:hover > img {
		transform-style: initial;
		transform: rotateX(calc(-1 * var(--group-translate)));
	}
</style>
