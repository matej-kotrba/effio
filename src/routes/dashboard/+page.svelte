<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { page } from '$app/stores';
	let templates: QuestionTemplate[] = [];

	async function getTemplates() {
		templates = (await trpc($page).getQuestionsTypes.query()) as unknown as QuestionTemplate[];
	}

	getTemplates();
</script>

<div class="text-primary">
	{#each templates as template}
		<p>{template.name}</p>
	{/each}
</div>
