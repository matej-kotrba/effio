<script lang="ts">
	export let onClick = () => {};
	export let title: string = '';
</script>

<button
	type="button"
	on:click={onClick}
	class={`px-8 shadow-lg bg-light_whiter dark:bg-dark_light_grey btn
	 text-success hover:bg-white dark:hover:bg-dark_light_grey
	  hover:text-success border-2 border-solid border-light_grey dark:border-dark_terciary hover:border-success dark:hover:border-success`}
	>{title || 'Add'}</button
>
<!-- <button
	type="button"
	on:click={onClick}
	class="grid p-2 duration-150 rounded-full shadow-md group shadow-primary place-content-center w-fit bg-light_whiter hover:bg-light_secondary"
>
	<Icon
		icon="ic:round-plus"
		class="text-5xl duration-150 rounded-lg text-light_secondary group-hover:text-light_whiter"
	/>
</button> -->
