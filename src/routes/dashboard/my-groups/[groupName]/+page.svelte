<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';
	import { page } from '$app/stores';
	import IconButton from '~components/buttons/IconButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import Space from '~components/separators/Space.svelte';
	import { createTRPCErrorNotification } from '~/lib/utils/notification';
	import { TRPCClientError } from '@trpc/client';
	import ImageImportV2, {
		setImageUpload
	} from '~components/inputs/ImageImportV2.svelte';
	import {
		ALLOWED_IMAGE_TYPES,
		DB_STRING_MESSAGE,
		DB_STRING_REGEX,
		GROUP_SUBCATEGORY_TYPES,
		IMAGE_IMPORT_SIZE_IN_MB,
		groupSubcategoryIcons
	} from '~helpers/constants';
	import type { Choice } from '~components/inputs/TypeRadioGroup.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import {
		channelCreateSchema,
		channelDeleteSchema,
		channelUpdateSchema,
		deleteGroupSchema,
		kickUserFromGroupSchema,
		updateGroupSchema
	} from '../schemas.js';
	import TypeRadioGroup from '~components/inputs/TypeRadioGroup.svelte';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import {
		channelNameSchema,
		groupNameSchema
	} from '~schemas/testValidation.js';
	import Channel from './Channel.svelte';
	import ChannelAddNew from './ChannelAddNew.svelte';
	import Invalidating from '~components/portals/Invalidating.svelte';
	import * as Popover from '~/lib/components/ui/popover/index';
	import User from './User.svelte';
	import { Switch } from '~components/ui/switch/index';
	import * as DropdownMenu from '~components/ui/dropdown-menu/index';

	export let data;

	$: ownerData = data.group.users.find(
		(item) => item.userId === data.group.ownerId
	);

	const newChannelChoices: Choice[] = [
		{
			icon: groupSubcategoryIcons.CHAT,
			title: 'Chat',
			value: GROUP_SUBCATEGORY_TYPES.CHAT,
			description:
				'Channel open for everyone to chat, owner can share files and tests'
		},
		{
			icon: groupSubcategoryIcons.ANNOUCEMENT,
			title: 'Announcement',
			value: GROUP_SUBCATEGORY_TYPES.ANNOUCEMENT,
			description: 'Channel for announcements, only owner can post here'
		}
	];

	let openNewChannelDialog: () => void;
	let closeNewChannelDialog: () => void;
	let openUpdateChannelDialog: () => void;
	let closeUpdateChannelDialog: () => void;
	let openDeleteChannelDialog: () => void;
	let closeDeleteChannelDialog: () => void;
	let openCodeDialog: () => void;
	let openSettingsDialog: () => void;
	let closeSettingsDialog: () => void;
	let openKickOrBanDialog: () => void;
	let closeKickOrBanDialog: () => void;

	const {
		form: formCreate,
		errors: errorsCreate,
		enhance: enhanceCreate,
		submitting: submittingCreate,
		reset: resetCreate
	} = superForm(data.createChannelForm, {
		resetForm: true,
		validators: channelCreateSchema
	});

	const {
		form: formUpdateChannel,
		errors: errorsUpdateChannel,
		enhance: enhanceUpdateChannel,
		submitting: submittingUpdateChannel,
		reset: resetUpdateChannel
	} = superForm(data.updateChannelForm, {
		resetForm: true,
		validators: channelUpdateSchema
	});

	const {
		form: formDeleteChannel,
		errors: errorsDeleteChannel,
		enhance: enhanceDeleteChannel,
		submitting: submittingDeleteChannel,
		reset: resetDeleteChannel
	} = superForm(data.deleteChannelForm, {
		resetForm: true,
		validators: channelDeleteSchema
	});

	const {
		form: formUpdateGroup,
		errors: errorsUpdateGroup,
		enhance: enhanceUpdateGroup,
		submitting: submittingUpdateGroup,
		reset: resetUpdateGroup
	} = superForm(data.updateGroupForm, {
		resetForm: true,
		validators: updateGroupSchema
	});

	const {
		form: formDeleteGroup,
		errors: errorsDeleteGroup,
		enhance: enhanceDeleteGroup,
		submitting: submittingDeleteGroup,
		reset: resetDeleteGroup
	} = superForm(data.deleteGroupForm, {
		resetForm: true,
		validators: deleteGroupSchema
	});

	const {
		form: formKickUserFromGroup,
		errors: errorsKickUserFromGroup,
		enhance: enhanceKickUserFromGroup,
		submitting: submittingKickUserFromGroup,
		reset: resetKickUserFromGroup
	} = superForm(data.kickUserFromGroupForm, {
		resetForm: true,
		validators: kickUserFromGroupSchema
	});

	let isInvalidating = false;

	function onUpdateOrDeleteChannel(
		channelId: string,
		type: 'update' | 'delete'
	) {
		if (type === 'update') {
			$formUpdateChannel.id = channelId;
			openUpdateChannelDialog();
		} else if (type === 'delete') {
			$formDeleteChannel.id = channelId;
			openDeleteChannelDialog();
		}
	}

	function onKickOrBanUser(userId: string | null, type: 'kick' | 'ban') {
		if (userId === null) return;
		openKickOrBanDialog();
		$formKickUserFromGroup.userId = userId;
		$formKickUserFromGroup.shouldBan = type === 'ban';
	}

	let fileInputRef: HTMLInputElement;
	let uploadedImageUrl: string = '';

	let code: string = '';

	function onOpenInvite() {
		openCodeDialog();
		getOrCreateInviteCode();
	}

	async function getOrCreateInviteCode() {
		if (code) return;
		if (data.session?.user?.id !== data.group.ownerId) return;
		const response = await trpc($page).groupInvites.createInvite.mutate({
			groupId: data.group.id
		});
		if (response) code = response.id;
	}

	async function leaveGroup() {
		if (data.session?.user?.id === data.group.ownerId) return;
		try {
			const response = await trpc($page).groups.leaveGroup.mutate({
				groupId: data.group.id
			});
			if (response.success) {
				goto('/dashboard/my-groups');
				toast.success('You successfully left the group');
			}
		} catch (e) {
			if (e instanceof TRPCClientError) createTRPCErrorNotification(e);
		}
	}

	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		setImageUpload(
			e,
			ALLOWED_IMAGE_TYPES,
			IMAGE_IMPORT_SIZE_IN_MB,
			(file, resultUrl) => {
				uploadedImageUrl = resultUrl;
			}
		);
	}
</script>

<Dialog
	isSubmitting={$submittingCreate}
	bind:open={openNewChannelDialog}
	bind:close={closeNewChannelDialog}
	onDialogClose={() => {
		resetCreate();
	}}
	title="New channel"
>
	<form
		method="POST"
		action="?/createChannel"
		use:enhanceCreate={{
			onResult: ({ result }) => {
				if (result['status'] === 200) {
					toast.success('Channel created successfully!');
					closeNewChannelDialog();
					isInvalidating = true;
				} else if (result['type'] === 'failure') {
					console.log(result);
					toast.error(
						result.data?.error ? result['data']['error'] : 'Error ocurred'
					);
				}
			},
			onUpdated: () => {
				isInvalidating = false;
			}
		}}
	>
		<input type="hidden" name="id" value={data.group.id} />
		<TypeRadioGroup
			choices={newChannelChoices}
			inputGroupName={'newChannelType'}
			class="my-2"
			bind:selectedRadio={$formCreate.newChannelType}
		/>
		<ErrorEnhance
			error={$errorsCreate.name ? $errorsCreate.name[0] : undefined}
		>
			<TextInputSimple
				title="Channel name"
				titleName="name"
				inputProperties={{ placeholder: 'Channel name...' }}
				validationSchema={channelNameSchema}
				validator={{ query: DB_STRING_REGEX, message: DB_STRING_MESSAGE }}
				displayOutside={true}
				bind:inputValue={$formCreate.name}
			/>
		</ErrorEnhance>
		<div class="flex justify-end gap-2 mt-1">
			<SimpleButton variant="ghost" onClick={closeNewChannelDialog}
				>Cancel</SimpleButton
			>
			<SimpleButton
				variant="filled"
				designType="primary"
				type="submit"
				disabled={$formCreate['name'].length === 0 ||
					!!$errorsCreate.id?.length ||
					!!$errorsCreate.name?.length ||
					!!$errorsCreate.newChannelType?.length ||
					isInvalidating}>Create Channel</SimpleButton
			>
		</div>
	</form>
</Dialog>
<Dialog
	isSubmitting={$submittingUpdateChannel}
	bind:open={openUpdateChannelDialog}
	bind:close={closeUpdateChannelDialog}
	onDialogClose={() => {
		resetUpdateChannel();
	}}
	title="Update channel"
>
	<form
		method="POST"
		action="?/updateChannel"
		use:enhanceUpdateChannel={{
			onResult: ({ result }) => {
				if (result['status'] === 200) {
					toast.success('Channel updated successfully!');
					closeUpdateChannelDialog();
					isInvalidating = true;
				} else if (result['type'] === 'failure') {
					console.log(result);
					toast.error(
						result.data?.error ? result['data']['error'] : 'Error ocurred'
					);
				}
			},
			onUpdated: () => {
				isInvalidating = false;
			}
		}}
	>
		<input type="hidden" name="id" bind:value={$formUpdateChannel.id} />
		<ErrorEnhance
			error={$errorsUpdateChannel.name
				? $errorsUpdateChannel.name[0]
				: undefined}
		>
			<TextInputSimple
				title="Channel name"
				titleName="name"
				inputProperties={{ placeholder: 'Channel name...' }}
				validationSchema={channelNameSchema}
				validator={{ query: DB_STRING_REGEX, message: DB_STRING_MESSAGE }}
				displayOutside={true}
				bind:inputValue={$formUpdateChannel.name}
			/>
		</ErrorEnhance>
		<div class="flex justify-end gap-2 mt-1">
			<SimpleButton variant="ghost" onClick={closeUpdateChannelDialog}
				>Cancel</SimpleButton
			>
			<SimpleButton
				variant="filled"
				designType="primary"
				type="submit"
				disabled={$formUpdateChannel['name'].length === 0 ||
					!!$errorsUpdateChannel.id?.length ||
					!!$errorsUpdateChannel.name?.length ||
					isInvalidating}>Update Channel</SimpleButton
			>
		</div>
	</form>
</Dialog>
<Dialog
	isSubmitting={$submittingDeleteChannel}
	bind:open={openDeleteChannelDialog}
	bind:close={closeDeleteChannelDialog}
	onDialogClose={() => {
		resetDeleteChannel();
	}}
	title="Delete channel"
>
	<form
		method="POST"
		action="?/deleteChannel"
		use:enhanceDeleteChannel={{
			onResult: ({ result }) => {
				if (result['status'] === 200) {
					toast.success('Channel deleted successfully!');
					closeDeleteChannelDialog();
					isInvalidating = true;
				} else if (result['type'] === 'failure') {
					console.log(result);
					toast.error(
						result.data?.error ? result['data']['error'] : 'Error ocurred'
					);
				}
			},
			onUpdated: () => {
				isInvalidating = false;
			}
		}}
	>
		<input type="hidden" name="id" bind:value={$formDeleteChannel.id} />
		<p>
			You are about to delete <span class="font-semibold"
				>"{data.group.groupsSubcategories.find(
					(item) => item.id === $formDeleteChannel.id
				)?.name}"</span
			> channel!
		</p>
		<div class="flex justify-end gap-2 mt-1">
			<SimpleButton variant="ghost" onClick={closeDeleteChannelDialog}
				>Cancel</SimpleButton
			>
			<SimpleButton
				variant="filled"
				designType="primary"
				type="submit"
				disabled={!!$errorsDeleteChannel.id?.length || isInvalidating}
				>Delete Channel</SimpleButton
			>
		</div>
	</form>
</Dialog>
<Dialog bind:open={openCodeDialog} title={'Group invitation code'}>
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
<Dialog
	isSubmitting={$submittingUpdateGroup}
	title="Group settings"
	bind:open={openSettingsDialog}
	bind:close={closeSettingsDialog}
	onDialogClose={() => {
		// Reseting the form on closing the dialog
		uploadedImageUrl = '';
		fileInputRef.value = '';
		resetUpdateGroup();
	}}
>
	<div class="max-h-[max(200px,60vh)] overflow-y-auto px-2">
		<h5>Updating group</h5>
		<Separator w="100%" h="1px" />
		<Space gap={16} />
		<form
			method="POST"
			action="?/updateGroup"
			enctype="multipart/form-data"
			use:enhanceUpdateGroup={{
				onResult: ({ result }) => {
					if (result['status'] === 200) {
						toast.success('Group updated successfully!');
						closeSettingsDialog();
						isInvalidating = true;
					} else if (result['type'] === 'failure') {
						console.log(result);
						toast.error(
							result['data'] && result['data']['error']
								? result['data']['error']
								: 'Error ocurred'
						);
					}
				},
				onUpdated: () => {
					isInvalidating = false;
				}
			}}
		>
			<input type="hidden" name="id" value={data.group.id} />
			<ErrorEnhance
				error={$errorsUpdateGroup.name ? $errorsUpdateGroup.name[0] : undefined}
			>
				<TextInputSimple
					title="Group name"
					titleName="name"
					inputProperties={{ placeholder: 'Group name...' }}
					validationSchema={groupNameSchema}
					validator={{ query: DB_STRING_REGEX, message: DB_STRING_MESSAGE }}
					displayOutside={true}
					bind:inputValue={$formUpdateGroup.name}
				/>
			</ErrorEnhance>
			<ImageImportV2
				bind:fileInput={fileInputRef}
				inputId={'group'}
				allowedImageTypes={ALLOWED_IMAGE_TYPES}
				uploadedImageUrl={uploadedImageUrl || data.group.imageUrl}
				onReset={() => {
					uploadedImageUrl = '';
				}}
				{onImageUpload}
			/>
			<div class="flex justify-end gap-2 mt-2">
				<SimpleButton variant="ghost" onClick={closeSettingsDialog}
					>Cancel</SimpleButton
				>
				<SimpleButton
					variant="filled"
					designType="primary"
					type="submit"
					disabled={isInvalidating || !!$errorsUpdateGroup.name?.length}
					>Update Group</SimpleButton
				>
			</div>
		</form>
		<h5>Group settings</h5>
		<Separator w="100%" h="1px" />
		<Space gap={16} />
		<Popover.Root portal={null}>
			<Popover.Trigger>
				<SimpleButton
					variant="filled"
					designType="primary"
					class="text-white duration-100 bg-error hover:brightness-90 dark:bg-dark_error hover:bg-error dark:hover:bg-dark_error"
					type="button"
					disabled={isInvalidating || !!$errorsUpdateGroup.name?.length}
					>Delete Group</SimpleButton
				>
			</Popover.Trigger>
			<Popover.Content class="w-[min(90vw,24rem)]">
				<form
					method="POST"
					action="?/deleteGroup"
					use:enhanceDeleteGroup={{
						onResult: ({ result }) => {
							if (result['status'] === 200) {
								toast.success('Group deleted successfully!');
								closeNewChannelDialog();
								isInvalidating = true;
							} else if (result['type'] === 'failure') {
								toast.error(
									result.data?.error ? result['data']['error'] : 'Error ocurred'
								);
							}
						},
						onUpdated: () => {
							isInvalidating = false;
						}
					}}
				>
					<p class="text-body2">
						Please rewrite the name <span
							class="font-semibold text-body1 text-light_text_black dark:text-dark_text_white"
							>"{data.group.name}"</span
						> if you want to delete this group
					</p>
					<input type="hidden" name="id" value={data.group.id} />
					<TextInputSimple
						displayTitle={false}
						title="Group name"
						titleName="validation_name"
						class="py-2"
						bind:inputValue={$formDeleteGroup.validation_name}
					/>
					<div class="flex justify-end">
						<SimpleButton
							variant="filled"
							designType="primary"
							class="text-white duration-100 text-body2 bg-error hover:brightness-90 dark:bg-dark_error hover:bg-error dark:hover:bg-dark_error"
							type="submit"
							disabled={isInvalidating || !!$errorsUpdateGroup.name?.length}
							>Delete</SimpleButton
						>
					</div>
				</form>
			</Popover.Content>
		</Popover.Root>
	</div>
</Dialog>
<Dialog
	bind:open={openKickOrBanDialog}
	bind:close={closeKickOrBanDialog}
	title={'Kicking user'}
	onDialogClose={() => {
		resetKickUserFromGroup();
	}}
>
	<form
		method="POST"
		action="?/kickUser"
		use:enhanceKickUserFromGroup={{
			onResult: ({ result }) => {
				if (result['status'] === 200) {
					toast.success('Successfully removed user from the group!');
					closeKickOrBanDialog();
					isInvalidating = true;
				} else if (result['type'] === 'failure') {
					toast.error(
						result.data?.error ? result['data']['error'] : 'Error ocurred'
					);
				}
			},
			onUpdated: () => {
				isInvalidating = false;
			}
		}}
	>
		<input type="hidden" name="groupId" value={data.group.id} />
		<input
			type="hidden"
			name="userId"
			bind:value={$formKickUserFromGroup.userId}
		/>
		<p>
			You are about to kick user <span class="font-semibold"
				>"{data?.group?.users?.find(
					(item) => item.userId === $formKickUserFromGroup.userId
				)?.user?.name || ''}"</span
			> from the group!
		</p>
		<Separator w="100%" h="1px" class="my-2" />
		<div class="flex flex-wrap gap-2">
			<p>Should user be banned?</p>
			<Switch
				bind:checked={$formKickUserFromGroup.shouldBan}
				name="shouldBan"
			/>
		</div>
		<div class="flex justify-end gap-2 mt-1">
			<SimpleButton variant="ghost" onClick={closeKickOrBanDialog}
				>Cancel</SimpleButton
			>
			<SimpleButton
				variant="filled"
				designType="primary"
				class="bg-error hover:brightness-90 hover:bg-error dark:bg-dark_error dark:hover:bg-dark_error"
				type="submit"
				disabled={isInvalidating}
				>Kick {$formKickUserFromGroup.shouldBan ? '& Ban' : ''} user</SimpleButton
			>
		</div>
	</form>
</Dialog>
<Invalidating invalidating={isInvalidating} />
<div class="p-4">
	<div class="flex justify-between">
		<di class="mb-4">
			<h3 class="text-h3">
				<span class="font-thin">Welcome to</span>
				<span class="font-semibold">{data.group.name}</span>
			</h3>
		</di>
		{#if data.session?.user?.id !== data.group.ownerId}
			<div>
				<IconButton icon="pepicons-pop:leave" onClick={leaveGroup} />
			</div>
		{/if}
	</div>
	{#if data.session?.user?.id === data.group.ownerId}
		<Space gap={16} />
		<h4 class="text-h5">Administration</h4>
		<Separator w="100%" h="1px" />
		<Space gap={16} />
		<div class="flex gap-2">
			<a href="{$page.url.pathname}/admin-test-overview">
				<IconButton
					icon="uis:graph-bar"
					buttonClasses="text-5xl"
					tooltip="Tests overview and data"
				/>
			</a>
			<IconButton
				icon="material-symbols:person-add"
				buttonClasses="text-5xl"
				onClick={onOpenInvite}
				tooltip="Invite code for people to join"
			/>
			<IconButton
				icon="fluent:settings-24-filled"
				buttonClasses="text-5xl"
				onClick={openSettingsDialog}
				tooltip="Group settings"
			/>
		</div>
	{/if}
	<Space gap={16} />
	<h4 class="text-h5">Channels</h4>
	<Separator w="100%" h="1px" />
	<Space gap={16} />
	<div class="channel-grid__container">
		{#each data.group.groupsSubcategories as channel}
			<Channel
				name={channel.name}
				type={channel.type}
				imageUrl={channel.image}
				redirectLink={`/dashboard/my-groups/${data.group.slug}/${channel.slug}/chat`}
				isOwner={data.session?.user?.id === data.group.ownerId}
			>
				{#if data.session?.user?.id === data.group.ownerId}
					<DropdownMenu.Item
						class="cursor-pointer"
						on:click={() => {
							onUpdateOrDeleteChannel(channel.id, 'update');
						}}
					>
						<iconify-icon icon="iconamoon:edit-light" class="mr-1 text-2xl" />
						Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item
						class="cursor-pointer"
						on:click={() => {
							onUpdateOrDeleteChannel(channel.id, 'delete');
						}}
					>
						<iconify-icon
							icon="fluent:delete-28-filled"
							class="mr-1 text-2xl"
						/>
						Delete
					</DropdownMenu.Item>
				{/if}
			</Channel>
		{/each}
		{#if data.group.ownerId === data.session?.user?.id}
			<ChannelAddNew onClick={openNewChannelDialog} />
		{/if}
	</div>
	<Space gap={16} />
	<h4 class="text-h5">Users</h4>
	<Separator w="100%" h="1px" />
	<Space gap={16} />
	<div class="user-grid__container">
		{#if ownerData}
			<User
				dispalyOptions={false}
				onKickOrBanClick={onKickOrBanUser}
				groupOnUser={ownerData}
				isOwner={true}
			/>
		{/if}
		{#each data.group.users.filter((item) => item['userId'] !== data.group.ownerId) as groupOnUser}
			<User
				{groupOnUser}
				onKickOrBanClick={onKickOrBanUser}
				isOwner={false}
				dispalyOptions={data.session?.user?.id === data.group.ownerId}
			/>
		{/each}
	</div>
</div>

<style>
	.channel-grid__container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.5rem;
	}

	.user-grid__container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.5rem;
	}

	.grid-leader__container {
		grid-template-columns: auto 1fr;
		grid-auto-rows: auto;
	}
</style>
