<script lang="ts">
	export let onClick: () => void;
</script>

<button
	type="button"
	class="relative w-full aspect-[3/2] px-4 border bg-light_grey border-light_text_black_10 rounded-md shadow-sm dark:border-dark_text_white_10 dark:bg-dark_grey dark:hover:bg-dark_light_grey"
	on:click={onClick}
>
	<iconify-icon
		class="grid p-2 mx-auto text-6xl rounded-lg w-fit place-content-center text-light_text_black_60 dark:text-dark_text_white_80"
		icon={'uil:plus'}
	/>
</button>
