<script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import { signIn } from '@auth/sveltekit/client';
	import SkewedLoader from '~components/loaders/Skewed.svelte';

	let isProcessing = false;
</script>

<div class="py-2 bg">
	<div class="relative px-6 py-3 bg-white w-[95vw] max-w-[450px] rounded-md">
		<div
			class="absolute inset-0 z-10 rounded-md bg-light_text_black_40 place-content-center {isProcessing
				? 'grid'
				: 'hidden'}"
		>
			<SkewedLoader />
		</div>
		<h2
			class="text-center uppercase text-h5 text-light_text_black dark:text-dark_text_white"
		>
			Login
		</h2>
		<Separator w={'100%'} h={'2px'} color="var(--light-text-black-20)" />
		<Space gap={10} />
		<p
			class="text-center text-light_text_black dark:text-dark_text_white_60 text-body2"
		>
			For Effio we use login via providers like <br />
			<span class="font-bold text-light_text_black dark:text-dark_text_white_80"
				>Google</span
			>
			and
			<span class="font-bold text-light_text_black dark:text-dark_text_white_80"
				>GitHub</span
			>.
		</p>
		<Space gap={10} />
		<div>
			<img src="./imgs/svgs/login.svg" alt="Login illustration" />
		</div>
		<Space gap={10} />
		<Collapsible title={'Why not password login?'} position={'center'}>
			<p
				class="text-body4 md:text-body2 text-light_text_black dark:text-dark_text_white_80"
			>
				Providers like Google, GitHub, or any other can provide an easy
				authentication solution without the need for custom usernames or
				passwords. This is very convenient for users because they do not need to
				remember any login credentials, and it is also beneficial for us as we
				do not have to store sensitive data like passwords or usernames.
				Additionally, this approach offers enhanced security as it leverages the
				infrastructure and expertise of larger service providers who are
				dedicated to safeguarding user credentials.
			</p>
		</Collapsible>
		<Space gap={10} />
		<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
			<button
				type="button"
				on:click={() => {
					signIn('google');
					isProcessing = true;
				}}
				class="flex items-center gap-3 px-6 py-2 text-orange-400 duration-100 border-2 border-orange-400 border-solid rounded-md active:scale-90 hover:scale-105"
				><Icon icon="devicon:google" /><span class="font-semibold text-body2"
					>Google</span
				></button
			>
			<span class="text-light_text_black dark:text-dark_text_white_40">or</span>
			<button
				type="button"
				on:click={() => {
					signIn('github');
					isProcessing = true;
				}}
				class="flex items-center gap-3 px-6 py-2 text-black duration-100 border-2 border-black border-solid rounded-md active:scale-90 hover:scale-105"
				><Icon icon="mdi:github" /><span class="font-semibold text-body2"
					>GitHub</span
				></button
			>
		</div>
	</div>
</div>

<style>
	.bg {
		min-height: 100vh;
		background-image: linear-gradient(
			256.86deg,
			#c2a5ff 12.78%,
			#6c63ff 90.64%
		);
		display: grid;
		place-content: center;
	}
</style>
