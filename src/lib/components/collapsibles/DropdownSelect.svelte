<script lang="ts">
	export let dropdownTabs: {
		text: string;
		iconClass?: string;
		action: (e: MouseEvent) => void;
	}[];
</script>

<div class="dropdown dropdown-hover dropdown-top z-[102]">
	<button type="button" class="flex items-center">
		<slot />
	</button>
	<ul
		class="w-40 p-2 -translate-x-1/2 bg-white dropdown-content menu shadow-surrounding shadow-light_text_black_20 rounded-box left-1/2 text-light_text_black dark:text-dark_text_white dark:bg-dark_grey"
	>
		{#each dropdownTabs as item}
			<li class="group">
				<button
					type="button"
					class="flex items-center justify-start active:!bg-light_grey active:!text-light_text_black_80 dark:active:!text-dark_text_white dark:active:!bg-dark_light_grey text-light_text_black group-hover:text-light_text_black dark:group-hover:text-dark_text_white dark:!text-dark_text_white dark:hover:bg-dark_text_white_20 dark:hover:text-white"
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
