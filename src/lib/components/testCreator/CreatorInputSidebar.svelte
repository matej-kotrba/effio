<script lang="ts">
	type Inputs = {
		name: string;
	};

	export let inputs: Inputs[];

	export { classes as class };
	let classes = '';
</script>

<div class="relative">
	<div class="sticky top-0 flex flex-col gap-2 p-2 {classes}">
		{#each inputs as input, index (index)}
			<div
				class="grid w-full bg-white rounded-md shadow-md shadow-light_text_black_40 aspect-square place-content-center"
			>
				{input.name}
			</div>
		{/each}
	</div>
</div>
