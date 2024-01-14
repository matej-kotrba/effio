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
	<div class="flex justify-between">
		<div>
			<h3 class="text-h3">
				<span class="font-thin">Welcome to</span>
				<span class="font-semibold">{data.group.name}</span>
			</h3>
			<p class="text-body1">
				{data.group.description}
			</p>
		</div>
		{#if data.session?.user?.id === data.group.ownerId}
			<div>
				<IconButton icon="material-symbols:person-add" onClick={onOpenInvite} />
				<IconButton icon="fluent:settings-24-filled" onClick={() => {}} />
			</div>
		{/if}
	</div>
	<div class="grid grid-cols-2 gap-4 mt-12">
		<div>
			<h4 class="text-h5">Quick navigation</h4>
			<Separator w={'100%'} h={'2px'} />
			<Space gap={10} />
			<div class="flex flex-col gap-1">
				{#each data['group']['groupsSubcategories'] as channel}
					<a
						href="{$page.url.href}/{channel.slug}"
						class="w-full px-4 py-2 border-2 border-solid border-light_text_black_80 rounded-2xl max-w-[24rem]
						hover:bg-light_grey duration-100 dark:hover:bg-dark_light_grey dark:border-dark_text_white_80"
					>
						{channel.name}
					</a>
				{/each}
			</div>
		</div>
		<div>
			<h4 class="text-h5">Users</h4>
			<Separator w={'100%'} h={'2px'} />
			<Space gap={10} />
			<div class="flex flex-col gap-1">
				<div class="grid grid-leader__container gap-x-1">
					<iconify-icon
						icon="akar-icons:crown"
						class="h-8 mx-auto text-3xl text-yellow-500 tooltip tooltip-top"
						data-tip="Group owner"
					/>
					<div
						class="w-12 col-start-1 row-start-2 overflow-hidden rounded-lg aspect-square"
					>
						<img
							src={data.group.owner.image || '/imgs/svgs/user-circle.svg'}
							alt={data.group.owner.name}
						/>
					</div>
					<span class="self-center col-start-2 row-start-2 font-semibold"
						>{data.group.owner.name}</span
					>
				</div>
				<Space gap={10} />
				{#each data['group']['users'] as user}
					{#if user.user && user.userId !== data.group.ownerId}
						<div class="flex items-center gap-1">
							<div class="w-12 overflow-hidden rounded-lg aspect-square">
								<img
									src={user.user.image || '/imgs/svgs/user-circle.svg'}
									alt={user.user.name}
								/>
							</div>
							<span class="font-semibold">{user.user.name}</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
		{#if data.session?.user?.id === data.group.ownerId}
			<div>
				<h4 class="text-h5">Admin section</h4>
				<Separator w={'100%'} h={'2px'} />
				<Space gap={10} />
				<div>
					<a
						href="/dashboard/my-groups/{data.group.slug}/admin-test-overview"
						class="p-2 rounded-md w-[200px] grid place-content-center shadow-md aspect-square bg-light_whiter dark:bg-dark_terciary"
					>
						<h5 class="font-semibold">Test overview</h5>
					</a>
				</div>
			</div>
		{/if}
	</div>

	<!-- <section class="p-2 rounded-md shadow-md bg-light_grey dark:bg-dark_grey">
			<div class="flex items-center justify-between">
				<h4 class="font-semibold text-h4">Admin part</h4>
				<IconButton icon="material-symbols:person-add" onClick={onOpenInvite} />
			</div>
			<div>
				<a
					href="/dashboard/my-groups/{data.group.slug}/admin-test-overview"
					class="p-2 rounded-md w-[200px] grid place-content-center shadow-md aspect-square bg-light_whiter dark:bg-dark_terciary"
				>
					<h5>Test overview</h5>
				</a>
			</div>
		</section> -->
</div>

<style>
	.grid-leader__container {
		grid-template-columns: auto 1fr;
		grid-auto-rows: auto;
	}
</style>
