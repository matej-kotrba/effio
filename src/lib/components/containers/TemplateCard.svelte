<script lang="ts">
	export let title: string;
	export let imageSrc: string;
	export let onClick: Function = () => {};
	export let customClasses: string = '';
</script>

<button
	type="button"
	class="w-full h-full p-5 rounded-xl shadow-surrounding max-w-xxs aspect-square box duration-300
	 {customClasses}"
	on:click={(event) => onClick(event)}
>
	<h4
		class="text-center text-h6 text-light_text_black dark:text-dark_text_white"
	>
		{title}
	</h4>
	<div class="grid place-content-center">
		<img
			src={imageSrc}
			alt="Tempalte"
			class="object-cover w-[100px] sm:w-[150px]"
			width="150"
		/>
	</div>
</button>

<style>
	.box {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	:global(.dark) .shadow-primary {
		--tw-shadow-color: var(--dark-primary-transparent) !important;
	}
</style>
