<script lang="ts">
	export let dropdownTabs: {
		text: string;
		iconClass?: string;
		action: (e: MouseEvent) => void;
	}[];
</script>

<div class="dropdown dropdown-hover dropdown-top">
	<button type="button" class="flex items-center">
		<slot />
	</button>
	<ul
		class="dropdown-content z-[1] menu p-2 shadow-surrounding shadow-light_text_black_20 rounded-box w-40 -translate-x-1/2 left-1/2 bg-white text-light_text_black dark:text-dark_text_white dark:bg-dark_grey"
	>
		{#each dropdownTabs as item}
			<li class="group">
				<button
					type="button"
					class="flex items-center justify-start group-hover:text-light_text_black dark:text-dark_text_white dark:hover:bg-dark_text_white_20 dark:hover:text-white"
					on:click={(e) => item.action(e)}
				>
					{#if item['iconClass']}
						<iconify-icon icon={item['iconClass']} class="text-md" />
					{/if}
					{item.text}</button
				>
			</li>
		{/each}
	</ul>
</div>
