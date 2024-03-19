<script lang="ts">
	import Separator from '../separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
	import { fly } from 'svelte/transition';
	import { intersect } from '~use/intersectionObserver';

	let displayName = false;
</script>

<footer class="relative bg-light_terciary dark:bg-dark_terciary">
	<div
		class="container relative flex flex-col items-start justify-between gap-10 px-10 pt-20 mx-auto md:flex-row"
	>
		<div
			class="flex flex-col items-center gap-4 mx-auto md:flex-row md:items-start md:mx-0"
		>
			<div class="flex flex-col justify-center w-max">
				<h5 class="font-semibold text-center text-light_whiter text-h5">
					Do you find Effio usefull?
				</h5>
				<span class="text-center text-dark_text_white_80 text-body2"
					>Leave a star on GitHub</span
				>
				<a
					href="https://github.com/matej-kotrba/effio"
					target="_blank"
					referrerpolicy="no-referrer"
					class="mx-auto text-light_whiter"
				>
					<iconify-icon icon="mdi:github" class="mx-auto text-[3rem]" />
				</a>
			</div>
			<Separator
				h="120px"
				w="2px"
				color="var(--dark-text-white-20)"
				class="self-center hidden md:block"
			/>
			<div class="flex flex-col items-start">
				<h6 class="font-semibold text-h6 text-light_whiter">Page links</h6>
				<a
					class="duration-100 text-dark_text_white_80 hover:text-dark_text_white dark:hover:text-dark_text_white text-body1"
					href="/">Home</a
				>
				<a
					class="duration-100 text-dark_text_white_80 hover:text-dark_text_white dark:hover:text-dark_text_white text-body1"
					href="/login">Log in</a
				>
				<a
					class="duration-100 text-dark_text_white_80 hover:text-dark_text_white dark:hover:text-dark_text_white text-body1"
					href="/dashboard">Dashboard</a
				>
				<a
					class="duration-100 text-dark_text_white_80 hover:text-dark_text_white dark:hover:text-dark_text_white text-body1"
					href="/community">Community</a
				>
			</div>
		</div>
		<div class="mx-auto md:mx-0">
			<h6 class="font-semibold text-center text-h6 text-light_whiter">
				Contact
			</h6>
			<Space gap={5} />
			<div class="flex justify-center gap-2">
				<a href="https://www.linkedin.com/in/matej-kotrba/">
					<iconify-icon icon="devicon:linkedin" class="text-5xl" />
				</a>
				<a href="https://github.com/matej-kotrba">
					<iconify-icon
						icon="devicon:github"
						class="text-5xl bg-white rounded-full"
					/>
				</a>
			</div>
		</div>
	</div>
	<div class="w-full px-2 py-4 text-center text-light_whiter">
		<h6>Created with <span class="text-h3">🦭</span> by</h6>
		<div
			class="flex justify-center gap-1 overflow-hidden font-bold text-center text-h4"
			use:intersect
			on:intersect={() => (displayName = true)}
			on:unintersect={() => (displayName = false)}
		>
			{#if displayName}
				{#each 'Matěj Kotrba' as letter, index (letter + index)}
					<div
						in:fly|global={{
							duration: 250,
							delay: index * 150,
							y: 100
						}}
					>
						<span>{letter}</span>
					</div>
				{/each}
			{:else}
				<span class="w-0 overflow-hidden opacity-0">Matěj Kotrba</span>
			{/if}
		</div>
	</div>
</footer>
