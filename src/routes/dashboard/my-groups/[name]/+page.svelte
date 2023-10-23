<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';
	import { page } from '$app/stores';
	import IconButton from '~components/buttons/IconButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { randomId } from '~helpers/randomId.js';
	import toast from 'svelte-french-toast';
	import Space from '~components/separators/Space.svelte';

	export let data;

	let openDialog: () => void;

	function onOpenInvite() {
		openDialog();
		getOrCreateInviteCode();
	}

	let code: string = '';

	async function getOrCreateInviteCode() {
		if (code) return;
		if (data.session?.user?.id !== data.group.ownerId) return;
		const response = await trpc($page).groupInvites.createInvite.mutate({
			groupId: data.group.id
		});
		if (response) code = response.id;
	}
</script>

<Dialog bind:open={openDialog} title={'Group invitation code'}>
	<h6 class="mt-4 font-bold text-center uppercase text-h5">Here's your code</h6>
	<div class="flex items-center justify-center gap-1">
		<input
			type="text"
			bind:value={code}
			class="p-2 font-semibold text-center uppercase rounded-md outline-none dark:bg-dark_light_grey"
			readonly
		/>
		<IconButton
			icon="solar:clipboard-bold"
			class="rounded-md"
			onClick={() => {
				navigator.clipboard.writeText(code);
				toast.success('Code copied to clipboard');
			}}
		/>
	</div>
	<Space gap={10} />
	<ul
		class="flex flex-col gap-2 dark:text-dark_text_white_60 text-light_text_black_60"
	>
		<li
			class="text-body2 list-item before:content-[''] before:w-2 before:aspect-square before:rounded-full before:bg-light_text_black_60 before:dark:bg-dark_text_white_60 before:inline-block before:mr-2"
		>
			You can share this code with people you want to invite to your group.
		</li>
		<li
			class="text-body2 list-item before:content-[''] before:w-2 before:aspect-square before:rounded-full before:bg-light_text_black_60 before:dark:bg-dark_text_white_60 before:inline-block before:mr-2"
		>
			Code can be used in "My groups" page, by clicking on the "Join group"
			button and entering code
		</li>
	</ul>
</Dialog>

<div class="p-4">
	{#if data.session?.user?.id === data.group.ownerId}
		<section class="p-2 rounded-md shadow-md bg-light_grey dark:bg-dark_grey">
			<div class="flex items-center justify-between">
				<h4 class="font-semibold text-h4">Admin part</h4>
				<IconButton icon="material-symbols:person-add" onClick={onOpenInvite} />
			</div>
			<!-- <Separator w="100%" h="1px" /> -->
			<div>
				<a
					href="/dashboard/my-groups/{data.group.slug}/admin-test-overview"
					class="p-2 rounded-md w-[200px] grid place-content-center shadow-md aspect-square bg-light_whiter dark:bg-dark_terciary"
				>
					<h5>Test overview</h5>
				</a>
			</div>
		</section>
	{/if}
</div>
