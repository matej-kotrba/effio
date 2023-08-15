<script lang="ts">
	export let deleteQuestion: Function;
	export let questionLength: number;
</script>

<button
	type="button"
	data-tip="Delete answer"
	class={`tooltip grid px-2 group place-content-center bg-light_white dark:bg-dark_black text-error dark:text-dark_error hover:bg-error hover:text-white rounded-l-md ${
		!(questionLength > 2)
			? 'text-gray-500 hover:text-gray-500 hover:bg-light_white dark:bg-dark_light_grey dark:text-dark_grey'
			: ''
	}`}
	disabled={!(questionLength > 2)}
	style="transition: 200ms background-color, 200ms color;"
	on:click={() => deleteQuestion()}
>
	<iconify-icon
		icon="material-symbols:close-rounded"
		class="text-3xl group-hover:rotate-90"
		style="transition: 200ms transform;"
	/>
</button>
