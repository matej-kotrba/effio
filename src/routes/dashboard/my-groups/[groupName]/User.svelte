<script lang="ts">
	import type { GroupOnUsers, User } from '@prisma/client';
	import { transformDate } from '~utils/date.js';
	import * as Tooltip from '~/lib/components/ui/tooltip/index';
	import * as DropdownMenu from '~components/ui/dropdown-menu/index';

	export let groupOnUser: GroupOnUsers & {
		user: Pick<User, 'email' | 'name' | 'image'> | null;
	};

	export let isOwner: boolean;

	export let onKickOrBanClick: (
		userId: string | null,
		type: 'kick' | 'ban'
	) => void;

	export let dispalyOptions = true;
</script>

<div
	class="flex items-center gap-2 p-2 border rounded-md bg-light_grey border-light_text_black_10 dark:bg-dark_grey dark:border-dark_text_white_10"
>
	<div class="min-w-[2.5rem] max-w-[3.5rem]">
		<!-- {transformDate(user.joinedAt)} -->
		<img
			src={groupOnUser.user?.image}
			alt=""
			role="presentation"
			class="object-cover overflow-hidden rounded-lg"
		/>
	</div>
	<div class="relative w-full max-w-full overflow-hidden">
		<div class="flex items-center justify-between">
			<div class="flex items-center w-full max-w-full gap-1 overflow-hidden">
				{#if isOwner}
					<Tooltip.Root openDelay={300}>
						<Tooltip.Trigger class="grid cursor-auto place-content-center">
							<iconify-icon
								icon="akar-icons:crown"
								class="text-2xl text-yellow-500"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<span class="text-body2">Group owner</span>
						</Tooltip.Content>
					</Tooltip.Root>
				{/if}
				<h5 class="truncate">
					{groupOnUser.user?.name}
				</h5>
			</div>
			{#if dispalyOptions}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<iconify-icon icon="tabler:dots" class="text-xl" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Group>
							<DropdownMenu.Label>User settings</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								class="cursor-pointer"
								on:click={() => {
									onKickOrBanClick(groupOnUser.userId, 'kick');
								}}
							>
								<iconify-icon
									icon="game-icons:boot-kick"
									class="mr-1 text-2xl"
								/>
								Kick
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="cursor-pointer"
								on:click={() => {
									onKickOrBanClick(groupOnUser.userId, 'ban');
								}}
							>
								<iconify-icon
									icon="game-icons:hammer-drop"
									class="mr-1 text-2xl"
								/>
								Kick & Ban
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
		<p
			class="truncate text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
			title={groupOnUser.user?.email}
		>
			{groupOnUser.user?.email}
		</p>
	</div>
</div>
