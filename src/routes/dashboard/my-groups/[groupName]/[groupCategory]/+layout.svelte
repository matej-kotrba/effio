<script lang="ts">
	import Tabs, { type Tab } from '~components/navigation/Tabs.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { beforeUpdate } from 'svelte';
	import { fly } from 'svelte/transition';

	export let data;

	$: slug = $page.url.pathname.split('/').at(-1);

	const FLY_DISTANCE = 400;
	const FLY_DURATION = 400;
	let animateDirection: 1 | -1 = 1;

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
		},
		{
			title: 'Source',
			slug: 'source',
			onTabSelect: (direction) => {
				animateDirection = direction;
				goto(`source`);
			}
		}
	];
</script>

{#if slug && tabs.some((tab) => tab.slug === slug)}
	<div class="p-2">
		<Tabs {tabs} activeTabSlug={slug} />
	</div>
{/if}
{#key data.url}
	<div
		in:fly={{
			x: FLY_DISTANCE * animateDirection,
			duration: FLY_DURATION,
			delay: FLY_DURATION
		}}
		out:fly={{
			x: FLY_DISTANCE * animateDirection * -1,
			duration: FLY_DURATION
		}}
	>
		<slot />
	</div>
{/key}
