<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';
	import { page } from '$app/stores';
	import IconButton from '~components/buttons/IconButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import { trpc } from '~/lib/trpc/client';

	export let data;

	let openDialog: () => void;

	let code: string = 'sj25-aiol4-4sd5';

	async function getOrCreateInviteCode() {
		if (data.session?.user?.id !== data.group.ownerId) return;
		const response = await trpc($page).groupInvites.createInvite.mutate({
			groupId: data.group.id
		});
		if (response) code = response.id;
	}
</script>

<Dialog bind:open={openDialog} title={'Group invitation code'}>
	<h6 class="font-bold text-center uppercase text-h5">Here's your code</h6>
	<div class="flex justify-center">
		<input
			type="text"
			bind:value={code}
			class="p-2 mx-auto font-semibold text-center uppercase rounded-md outline-none dark:bg-dark_light_grey"
			readonly
		/>
	</div>
</Dialog>

<div class="p-4">
	{#if data.session?.user?.id === data.group.ownerId}
		<section class="p-2 rounded-md shadow-md bg-light_grey dark:bg-dark_grey">
			<div class="flex items-center justify-between">
				<h4 class="font-semibold text-h4">Admin part</h4>
				<IconButton icon="material-symbols:person-add" onClick={openDialog} />
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
