<script lang="ts">
	export let width: `${number}px` | `${number}rem` | `${number}%` = '3rem';
	export let shouldExpand = false;
	export let fullText: string;
</script>

<button
	type="button"
	style={`width: ${width};`}
	class="relative grid items-center duration-150 bg-transparent shadow-md rounded-xl hover:bg-light_text_black_10 aspect-square hover:rounded-lg"
>
	<div class="absolute inset-0 grid place-content-center">
		<slot name="title" />
	</div>
	<div class="col-start-2 whitespace-nowrap">
		{fullText}
	</div>
</button>

<style>
	button {
		grid-template-columns: 1fr auto;
	}
</style>
