<script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '../separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
</script>

<footer class=" bg-light_whiter dark:bg-dark_terciary">
	<div
		class="container relative flex flex-col items-start justify-between gap-10 px-10 py-20 mx-auto md:flex-row"
	>
		<div
			class="flex flex-col items-center gap-4 mx-auto md:flex-row md:items-start md:mx-0"
		>
			<div class="flex flex-col justify-center w-max">
				<h5
					class="text-center text-light_text_black dark:text-dark_text_white text-h5"
				>
					Do you find Effio usefull?
				</h5>
				<span
					class="text-center text-light_text_black_60 dark:text-dark_text_white_80 text-body2"
					>Leave a star on GitHub</span
				>
				<a
					href="https://github.com/matej-kotrba/effio"
					target="_blank"
					referrerpolicy="no-referrer"
				>
					<iconify-icon
						icon="mdi:github"
						class="mx-auto text-[3rem] text-light_text_black dark:text-dark_text_white"
					/>
				</a>
			</div>
			<Separator
				h="120px"
				w="2px"
				color="var(--light-text-black-20)"
				class="self-center hidden md:block"
			/>
			<div class="flex flex-col items-start">
				<h6 class="text-h6">Page links</h6>
				<a
					class="duration-100 text-light_text_black_60 dark:text-dark_text_white_60 hover:text-light_text_black dark:hover:text-dark_text_white text-body1"
					href="/">Home</a
				>
				<a
					class="duration-100 text-light_text_black_60 dark:text-dark_text_white_60 hover:text-light_text_black dark:hover:text-dark_text_white text-body1"
					href="/login">Log in</a
				>
				<a
					class="duration-100 text-light_text_black_60 dark:text-dark_text_white_60 hover:text-light_text_black dark:hover:text-dark_text_white text-body1"
					href="/dashboard">Dashboard</a
				>
				<a
					class="duration-100 text-light_text_black_60 dark:text-dark_text_white_60 hover:text-light_text_black dark:hover:text-dark_text_white text-body1"
					href="/community">Community</a
				>
			</div>
		</div>
		<div class="mx-auto md:mx-0">
			<h6 class="text-center text-h6">Contact</h6>
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
</footer>
