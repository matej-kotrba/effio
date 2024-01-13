<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import { fly } from 'svelte/transition';
</script>

<button
	class="relative grid h-10 place-content-center"
	type="button"
	on:click={() => $applicationStates.darkMode.setIsDarkMode()}
>
	{#if $applicationStates['darkMode']['isDarkMode']}
		<iconify-icon
			icon="lucide:moon"
			class="text-4xl"
			in:fly={{
				y: -100,
				x: 0,
				duration: 150,
				delay: 150
			}}
			out:fly={{
				y: 100,
				x: 0,
				duration: 150
			}}
		/>
	{:else}
		<iconify-icon
			icon="mi:sun"
			class="text-4xl"
			in:fly={{
				y: -100,
				x: 0,
				duration: 150,
				delay: 150
			}}
			out:fly={{
				y: 100,
				x: 0,
				duration: 150
			}}
		/>
	{/if}
</button>
