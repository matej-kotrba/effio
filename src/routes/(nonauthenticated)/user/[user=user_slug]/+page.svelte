<script lang="ts">
	import { trpc } from '~/lib/trpc/client.js';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { optimistic } from '~utils/hooks.js';
	import { page } from '$app/stores';

	export let data;

	let isFollowed: boolean = false;

	let userData: Awaited<typeof data.streaming.userData>;
	let isCheckingData = false;

	data.streaming.userData.then((res) => {
		userData = res;
	});

	function onFollow() {
		if (!userData?.user?.id) return;
		optimistic(
			() => {
				isCheckingData = true;
				isFollowed = !isFollowed;
			},
			{
				initial: isFollowed,
				request: async () => {
					const followOnUser = await trpc(
						$page
					).protected.toggleUserFollow.mutate({
						userId: userData.user!.id
					});
					return followOnUser;
				},
				onResponse: (data, initialData) => {
					if (!data.success) {
						isFollowed = initialData;
					}
					isCheckingData = false;
				}
			}
		);
	}
</script>

<div class="grid__container max-w-[800px] mx-auto">
	{#await data.streaming.userData then res}
		{#if res.user}
			<div class="flex flex-col">
				<img
					src={res.user.image}
					alt={res.user.name}
					class="rounded-full w-[18rem] aspect-square"
				/>
				<Space gap={20} />
				<h2 class="font-semibold text-h5">{res.user.name}</h2>
				<span
					class="font-light text-semiBody1 text-light_text_black_60 dark:text-dark_text_white_60"
					>{res.user.slug}</span
				>
				<Space gap={10} />
				<SimpleButton
					onClick={onFollow}
					variant="ghost"
					class="border border-light_text_black_20 dark:border-dark_text_white_20"
					>Follow</SimpleButton
				>
			</div>
			<div />
		{/if}
	{/await}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: auto 1fr;
	}
</style>
