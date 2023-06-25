<script lang="ts">
	export let title: string;
	export let isChecked: boolean = false;
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="font-semibold uppercase text-light_text_black">{title}</span>
	<!-- <input type="checkbox" class={`toggle toggle-primary bg-white`} checked={isChecked} /> -->
	<button on:click={() => (isChecked = !isChecked)} class:active={isChecked} class={`toggle-input`}>
		<div class="relative">
			<span class="rounded-full bg-light_text_black" />
		</div>
	</button>
</div>

<style>
	.toggle-input {
		--container-width: 80px;
		--container-height: 25px;

		width: calc(var(--container-width) + 6px);
		height: calc(var(--container-height) + 6px);
		border-radius: 100px;
		background-color: white;
		border: 1px solid var(--light-text-black);
		padding: 2px;
	}

	.toggle-input span {
		width: var(--container-height);
		aspect-ratio: 1/1;
		position: absolute;
		left: 0;
		top: 50%;
		translate: 0 -50%;
		transition: 200ms ease-in-out;
	}

	.toggle-input.active span {
		left: calc(100% - var(--container-height));
	}
</style>
