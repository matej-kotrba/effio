<script lang="ts">
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let shouldDisplay = false;

	function onAgree() {
		shouldDisplay = false;
		if (browser) {
			localStorage.setItem('cookiesAccepted', 'true');
		}
	}

	onMount(() => {
		const isAccepted = localStorage.getItem('cookiesAccepted');
		if (!isAccepted) {
			shouldDisplay = true;
		}
	});
</script>

{#if shouldDisplay}
	<div
		transition:fly={{ y: 100, duration: 200 }}
		class="fixed -translate-x-1/2 bg-light_whiter bottom-8 left-1/2 z-[1000000] max-w-[32rem] p-4 rounded-2xl border border-light_text_black_20"
	>
		<p>
			This site uses cookies for it's functionality<span
				class="text-light_text_black_60"
				>, if you disagree you cannot remain using this site.</span
			>
		</p>
		<div class="flex justify-end">
			<SimpleButton title="I agree" variant="highlight" onClick={onAgree}
				>I agree</SimpleButton
			>
		</div>
	</div>
{/if}
