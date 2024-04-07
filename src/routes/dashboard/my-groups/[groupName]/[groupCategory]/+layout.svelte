<script lang="ts">
	import Tabs, { type Tab } from '~components/navigation/Tabs.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { beforeNavigate } from '$app/navigation';

	export let data;

	const FLY_DISTANCE = 400;
	const FLY_DURATION = 400;
	let animateDirection: 1 | -1 | 0 = 1;
	let animationMultiplier: 0 | 1 = 1;

	let slug: string | undefined;

	$: {
		slug = $page.url.pathname.split('/').at(-1);
		animationMultiplier = 1;
	}

	const tabs: Tab[] = [
		{
			title: 'Chat',
			slug: 'chat',
			onTabSelect: (direction) => {
				animateDirection = direction;
				goto(`chat`);
			}
		},
		{
			title: 'Tests',
			slug: 'tests',
			onTabSelect: (direction) => {
				animateDirection = direction;
				goto(`tests`);
			}
		}
		// {
		// 	title: 'Source',
		// 	slug: 'source',
		// 	onTabSelect: (direction) => {
		// 		animateDirection = direction;
		// 		goto(`source`);
		// 	}
		// }
	];

	beforeNavigate((event) => {
		const routes = tabs.map(
			(tab) => '/dashboard/my-groups/[groupName]/[groupCategory]/' + tab.slug
		);
		if (!event.to?.route.id || !routes.includes(event.to?.route.id)) {
			animationMultiplier = 0;
		}
	});
</script>

{#if slug && tabs.some((tab) => tab.slug === slug)}
	<div class="p-2">
		<Tabs {tabs} activeTabSlug={slug} />
	</div>
	{#key data.url}
		<div
			in:fly={{
				x: FLY_DISTANCE * animateDirection,
				duration: FLY_DURATION * animationMultiplier,
				delay: FLY_DURATION * animationMultiplier
			}}
			out:fly={{
				x: FLY_DISTANCE * animateDirection * -1,
				duration: FLY_DURATION * animationMultiplier
			}}
		>
			<slot />
		</div>
	{/key}
{:else}
	<slot />
{/if}
