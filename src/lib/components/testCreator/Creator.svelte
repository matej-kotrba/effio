<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clickOutside } from '~use/clickOutside';

	const inputs = ['Pick one', 'True / False', 'Multiple choice', 'Short answer', 'Long answer'];

	let openDropdown = false;
</script>

<div class="p-2 bg-light_white roudned-md text-light_text_black">
	<div class="relative flex justify-end">
		<div class="">
			<button
				class="p-2 rounded-lg bg-light_secondary text-whiter"
				on:click={() => (openDropdown = !openDropdown)}
			>
				<Icon
					icon="ic:round-plus"
					class="text-5xl rounded-lg text-light_white bg-light_secondary"
				/>
			</button>
			<div
				use:clickOutside
				on:clickoutside={() => (openDropdown = false)}
				class="absolute right-0 grid w-full grid-cols-8 gap-4 p-4 rounded-md shadow-lg bottom-full bg-light_whiter duration-200
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
