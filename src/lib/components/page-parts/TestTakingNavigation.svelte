<script lang="ts">
	import { testObject } from '~stores/testObject';
	import { fade } from 'svelte/transition';
	import type { Session } from '@auth/core/types';

	export let session: Session | null = null;

	export let result: QuestionServerCheckResponse<QuestionContent>[] | null =
		null;

	export let questionContainerRef: HTMLDivElement | null = null;

	function navigateToQuestion(index: number) {
		if (!questionContainerRef) return;
		questionContainerRef.scrollTo({
			top: questionContainerRef.children[index].scrollTop,
			behavior: 'smooth'
		});
	}
</script>

{#if result}
	<div>
		<h3>Test results</h3>
		{#each result as question, index}
			<a
				class="flex items-center gap-1"
				href="#{$testObject.questions[index].title}"
				on:click={() => navigateToQuestion(index)}
			>
				<p>{index + 1}. {$testObject.questions[index].title}</p>
				{#if question.isCorrect}
					<iconify-icon icon="ic:round-check" class="text-3xl text-green-500" />
				{:else}
					<iconify-icon icon="ic:round-close" class="text-3xl text-red-600" />
				{/if}
			</a>
		{/each}
	</div>
	<div class="sticky top-0 left-0 flex gap-2" in:fade>
		<a href="/community">
			<button
				class="btn dark:bg-dark_grey dark:border-dark_grey dark:text-dark_text_white dark:hover:bg-dark_quaternary"
				>Back to community</button
			>
		</a>
		{#if session?.user}
			<a href="/dashboard">
				<button
					class="btn dark:bg-dark_grey dark:border-dark_grey dark:text-dark_text_white dark:hover:bg-dark_quaternary"
					>Back to dashboard</button
				>
			</a>
		{/if}
	</div>
{/if}
