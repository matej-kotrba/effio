<script lang="ts">
	import type { GroupOnUsers, User } from '@prisma/client';
	import { transformDate } from '~utils/date.js';
	import * as Tooltip from '~/lib/components/ui/tooltip/index';

	export let groupOnUser: GroupOnUsers & {
		user: Pick<User, 'email' | 'name' | 'image'> | null;
	};
</script>

<div
	class="flex items-center gap-2 p-2 border rounded-md bg-light_grey border-light_text_black_10 dark:bg-dark_grey dark:border-dark_text_white_10"
>
	<div class="min-w-[2.5rem] max-w-[4rem]">
		<!-- {transformDate(user.joinedAt)} -->
		<img
			src={groupOnUser.user?.image}
			alt=""
			role="presentation"
			class="object-cover overflow-hidden rounded-lg"
		/>
	</div>
	<div class="relative w-full max-w-full overflow-hidden">
		<div class="flex items-center w-full max-w-full gap-1 overflow-hidden">
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
			<h5 class="truncate">
				{groupOnUser.user?.name}
			</h5>
		</div>
		<p
			class="truncate text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
			title={groupOnUser.user?.email}
		>
			{groupOnUser.user?.email}
		</p>
	</div>
</div>
