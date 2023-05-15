<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clickOutside } from '~use/clickOutside';

	const inputs = ['Pick one', 'True / False', 'Multiple choice', 'Short answer', 'Long answer'];

	let openDropdown = true;
</script>

<div class="p-2 bg-light_white roudned-md text-light_text_black">
	<div class="relative flex justify-end">
		<div class="">
			<button
				class="p-2 duration-200 rounded-lg bg-light_secondary text-whiter hover:bg-primary"
				on:click={() => (openDropdown = !openDropdown)}
			>
				<Icon icon="ic:round-plus" class="text-5xl rounded-lg text-light_white" />
			</button>
			<div
				use:clickOutside
				on:clickoutside={() => (openDropdown = false)}
				class="absolute right-0 w-full grid_layout gap-4 p-4 absoluteContainer
				rounded-md shadow-lg bottom-[calc(100%+10px)] bg-light_whiter duration-200
				{openDropdown ? '' : 'opacity-0 pointer-events-none'}"
			>
				{#each inputs as input}
					<div
						class="grid w-full rounded-md aspect-square text-light_whiter bg-light_primary place-content-center"
					>
						{input}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.grid_layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		overflow-y: scroll;
		max-height: 250px;
	}

	/* width */
	.absoluteContainer::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	.absoluteContainer::-webkit-scrollbar-track {
		background: var(--light-text-black-20);
		border-radius: 50px;
	}

	/* Handle */
	.absoluteContainer::-webkit-scrollbar-thumb {
		background: var(--light-terciary);
		border-radius: 50px;
	}

	/* Handle on hover */
	.absoluteContainer::-webkit-scrollbar-thumb:hover {
		background: var(--light-secondary);
	}
</style>
