<script lang="ts">
	import { goto } from '$app/navigation';

	export let link: string;
</script>

<button
	type="button"
	on:click={() => {
		goto(link);
	}}
>
	<iconify-icon
		icon="line-md:arrow-small-left"
		class="text-5xl duration-150 rounded-md hover:bg-gray-200 dark:hover:bg-dark_text_white_20"
	/>
</button>
