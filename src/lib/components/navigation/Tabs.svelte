<script lang="ts" context="module">
	export type Tab = {
		readonly title: string;
		readonly slug: string;
		onTabSelect: (direction: -1 | 1) => void;
	};
</script>

<script lang="ts">
	export let tabs: Tab[];
	export let activeTabSlug: (typeof tabs)[number]['slug'];

	function changeActiveTab(tab: (typeof tabs)[number]) {
		let slugs = tabs.map((tab) => tab['slug']);
		let direction;
		if (slugs.indexOf(activeTabSlug) < slugs.indexOf(tab['slug']))
			direction = 1 as const;
		else direction = -1 as const;

		if (activeTabSlug) activeTabSlug = tab['slug'];
		tab.onTabSelect(direction);
	}
</script>

<div
	class="flex flex-wrap p-1 mb-4 rounded-lg bg-light_grey dark:bg-dark_grey w-fit"
>
	{#each tabs as tab}
		<button
			on:click={() => changeActiveTab(tab)}
			type="button"
			class="px-16 border-[1px] border-solid rounded-lg {activeTabSlug ===
			tab['slug']
				? 'bg-light_whiter dark:bg-dark_light_grey border-light_text_black_20 dark:border-dark_text_white_20 text-light_text_black dark:text-dark_text_white'
				: 'bg-transparent border-transparent text-light_text_black_60 dark:text-dark_text_white_60'}"
			>{tab['title']}</button
		>
	{/each}
	<!-- <button
		on:click={() => changeActiveTab('details')}
		type="button"
		class="px-16 border-[1px] border-solid rounded-lg {activeTab === 'details'
			? 'bg-light_whiter dark:bg-dark_light_grey border-light_text_black_20 dark:border-dark_text_white text-light_text_black dark:text-dark_text_white'
			: 'bg-transparent border-transparent text-light_text_black_60 dark:text-dark_text_white_60'}"
		>Details</button
	>
	<button
		on:click={() => changeActiveTab('creator')}
		type="button"
		class="px-16 border-[1px] border-solid rounded-lg {activeTab === 'creator'
			? 'bg-light_whiter dark:bg-dark_light_grey border-light_text_black_20 dark:border-dark_text_white text-light_text_black dark:text-dark_text_white'
			: 'bg-transparent border-transparent text-light_text_black_60 dark:text-dark_text_white_60'}"
		>Creator</button
	> -->
</div>
