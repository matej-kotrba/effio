<script lang="ts">
	import Tabs, { type Tab } from '~components/navigation/Tabs.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let data;

	$: slug = $page.url.pathname.split('/').at(-1);

	const tabs: Tab[] = [
		{
			title: 'Chat',
			slug: 'chat',
			onTabSelect: async (direction) => {
				await goto(`chat`);
			}
		},
		{
			title: 'Tests',
			slug: 'tests',
			onTabSelect: async (direction) => {
				await goto(`tests`);
			}
		},
		{
			title: 'Source',
			slug: 'source',
			onTabSelect: (direction) => {
				goto(
					`/dashboard/my-groups/${data.group.slug}/${data.subcategory.slug}/source`
				);
			}
		}
	];
</script>

{#if slug && tabs.some((tab) => tab.slug === slug)}
	<div class="p-2">
		<Tabs {tabs} activeTabSlug={slug} />
	</div>
{/if}
<slot />
