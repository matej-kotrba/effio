<script lang="ts">
	import { trpc } from '~/lib/trpc/client.js';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import { optimistic } from '~utils/hooks.js';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Carousel from '~components/containers/Carousel.svelte';
	import CardAlternative from '~components/containers/card/CardAlternative.svelte';
	import CardGridContainer from '~components/containers/card/CardGridContainer.svelte';

	export let data;

	let isFollowed: boolean = false;

	let userData: Awaited<typeof data.streaming.userData>;
	let isCheckingData = true;
	let initialLoad = true;

	if (browser) {
		data.streaming.userData.then(async (res) => {
			userData = res;
			try {
				const isFollowing = await trpc($page).protected.isUserFollowing.mutate({
					userId: userData.user!.id
				});

				isFollowed = isFollowing;
			} catch {
			} finally {
				isCheckingData = false;
				initialLoad = false;
			}
		});
	}

	function onFollow() {
		if (!userData?.user?.id) return;
		if (userData.user?.id === data.session.user?.id) {
			return;
		}
		if (initialLoad) return;
		if (isCheckingData) return;
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

<div class="grid__container max-w-[1200px] mx-auto">
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
					class="font-light text-semiBody1 text-light_text_black_80 dark:text-dark_text_white_60"
					>{res.user.slug}</span
				>
				<Space gap={10} />
				<SimpleButton
					onClick={onFollow}
					variant="ghost"
					class="border border-light_text_black_20 dark:border-dark_text_white_20"
					disabled={isCheckingData}
				>
					{#if initialLoad}
						<span
							class="grid mx-auto loading loading-spinner text-primary place-content-center"
						/>
					{:else}
						{res.user.id === data.session.user?.id
							? 'Edit profile'
							: isFollowed
							? 'Unfollow'
							: 'Follow'}
					{/if}
				</SimpleButton>
			</div>
			<div>
				{#await data.streaming.userTests then tests}
					<CardGridContainer>
						{#each tests as test}
							<CardAlternative
								data={{
									id: test.id,
									title: test.title,
									description: test.description,
									createdAt: test.createdAt,
									img: test['imageUrl'],
									icon: test?.owner?.image || 'error',
									stars: test._count.stars,
									user: {
										name: test.owner.name || '',
										slug: test.owner.slug || ''
									},
									tags: test.tags.map((tag) => {
										return {
											id: tag.tag.id,
											name: tag.tag.name,
											slug: tag.tag.slug,
											color: tag.tag.color,
											createdAt: tag.tag.createdAt,
											updatedAt: tag.tag.updatedAt
										};
									})
								}}
							/>
						{/each}
					</CardGridContainer>
				{/await}
			</div>
		{/if}
	{/await}
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: auto 1fr;
	}
</style>
