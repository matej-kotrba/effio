<script lang="ts">
	import Space from '~components/separators/Space.svelte';

	export let title: string;
	export let subtitle: string;
</script>

<h2
	class="text-h3 font-extralight text-light_text_black dark:text-dark_text_white"
>
	{title}
</h2>
<p class="text-body1 text-light_text_black dark:text-dark_text_white_40">
	{subtitle}
</p>
<Space />
