<script lang="ts">
	export let title: string;
	export let imageSrc: string;
	export let onClick: Function = () => {};
	export let customClasses: string = '';
</script>

<button
	class="w-full p-5 rounded-xl shadow-surrounding max-w-xxs aspect-square box duration-300
	 {customClasses}"
	on:click={(event) => onClick(event)}
>
	<h4 class="text-center text-h6 text-light_text_black">{title}</h4>
	<div class="grid place-content-center">
		<img src={imageSrc} alt="Tempalte" class="object-cover" width="150" />
	</div>
</button>

<style>
	.box {
		display: grid;
		grid-template-rows: auto 1fr;
	}
</style>
