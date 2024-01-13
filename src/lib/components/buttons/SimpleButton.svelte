<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let onClick: () => void = () => {};

	export let classes = '';
</script>

<button
	type="button"
	on:click={onClick}
	class={twMerge(
		'relative bg-light_grey dark:bg-dark_grey px-4 py-2 font-semibold duration-200 rounded-md hover:bg-gray-200 dark:hover:bg-dark_light_grey hover:text-light_primary dark:hover:text-white',
		classes
	)}
>
	<slot />
</button>
