<script lang="ts">
	import type { Group } from '@prisma/client';
	import Dialog from '~components/portals/Dialog.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import {
		GROUP_DESCRIPTION_MAX,
		GROUP_DESCRIPTION_MIN,
		GROUP_NAME_MAX,
		GROUP_NAME_MIN,
		groupDescriptionSchema,
		groupNameSchema
	} from '~schemas/textInput';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';

	export let groups: Group[];

	let openDialog: () => void;

	let imageRef: HTMLImageElement | null = null;

	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (imageRef === null || !e.currentTarget.files) return;
		const file = e.currentTarget.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = () => {
			imageRef!.src = reader.result as string;
		};
	}
</script>

<Dialog bind:open={openDialog} title={'Create a new group'}>
	<TextInputSimple
		title="Group name"
		titleName="groupName"
		max={GROUP_NAME_MAX}
		min={GROUP_NAME_MIN}
		validationSchema={groupNameSchema}
		doesLimit
	/>
	<div class="flex gap-2 h-fit">
		<div class="flex flex-col">
			<span
				class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
				>Group photo</span
			>
			<div
				class="relative grid duration-100 border-2 border-dashed rounded-md group w-28 border-light_text_black_80 dark:border-dark_text_white_80 aspect-square place-content-center hover:bg-light_white dark:hover:bg-dark_quaternary"
			>
				<input
					type="file"
					on:change={onImageUpload}
					accept="image/jpeg, image/png, image/jpg, image/webp, image/avif"
					class="absolute w-full h-full opacity-0 cursor-pointer"
				/>
				<div
					class="absolute w-full overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-md pointer-events-none aspect-square left-1/2 top-1/2"
				>
					<img
						bind:this={imageRef}
						src=""
						alt="Group icon"
						class="object-cover w-full h-full text-transparent"
					/>
				</div>
				<iconify-icon
					icon="uil:plus"
					class="text-5xl pointer-events-none group-hover:z-10"
				/>
			</div>
		</div>
		<div>
			<TextAreaInput
				title="Group description"
				titleName="groupDescription"
				validationSchema={groupDescriptionSchema}
				doesLimit
				min={GROUP_DESCRIPTION_MIN}
				max={GROUP_DESCRIPTION_MAX}
				customStyles={'min-h-[100px]'}
			/>
		</div>
	</div>
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
