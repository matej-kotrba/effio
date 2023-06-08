<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { signOut } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';
	let templates: QuestionTemplate[] = [];

	async function getTemplates() {
		templates = (await trpc($page).getQuestionsTypes.query()) as unknown as QuestionTemplate[];
	}

	getTemplates();
</script>

<div class="text-primary">
	<button
		on:click={async () => {
			signOut({ redirect: false, callbackUrl: '/?logout=true' });
		}}
		type="submit">Click to sign out</button
	>
	{#each templates as template}
		<p>{template.name}</p>
	{/each}
</div>
