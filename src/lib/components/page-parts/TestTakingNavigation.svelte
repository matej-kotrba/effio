<script lang="ts">
	import { testObject } from '~stores/testObject';
	import { fade } from 'svelte/transition';
	import type { Session } from '@auth/core/types';
	import Space from '~components/separators/Space.svelte';

	export let session: Session | null = null;

	export let result: QuestionServerCheckResponse<QuestionContent>[] | null =
		null;

	export let questionContainerRef: HTMLDivElement | null = null;

	function navigateToQuestion(index: number) {
		if (!questionContainerRef) return;
		window.scrollTo({
			top:
				questionContainerRef.children[index].getBoundingClientRect().top +
				window.scrollY,
			behavior: 'smooth'
		});
	}
</script>

{#if result}
	<div class="mb-3">
		<h3 class="text-h4">Test results</h3>
		<Space gap={5} />
		{#each result as question, index}
			<button
				type="button"
				on:click={() => navigateToQuestion(index)}
				class="relative w-16 text-2xl font-bold rounded-md shadow-md bg-light_whiter aspect-square dark:bg-dark_grey dark:hover:bg-dark_light_grey hover:bg-light_white"
			>
				<div class="absolute top-0 right-0 text-xl">
					{#if question.isCorrect}
						<iconify-icon
							icon="ic:round-check"
							class="text-xl text-green-500"
						/>
					{:else}
						<iconify-icon icon="ic:round-close" class="text-xl text-red-600" />
					{/if}
				</div>
				{index + 1}
			</button>
			<!-- <button
				class="flex items-center gap-1 px-2 py-1 duration-100 rounded-md hover:bg-light_text_black_20 dark:hover:bg-dark_text_white_20"
				type="button"
				on:click={() => navigateToQuestion(index)}
			>
				{#if question.isCorrect}
					<iconify-icon icon="ic:round-check" class="text-3xl text-green-500" />
				{:else}
					<iconify-icon icon="ic:round-close" class="text-3xl text-red-600" />
				{/if}
				<p>{index + 1}. {$testObject.questions[index].title}</p>
			</button> -->
		{/each}
	</div>
	<div class="sticky left-0 z-10 flex gap-2 top-2" in:fade>
		<a href="/community">
			<button
				class="duration-100 shadow-md btn hover:bg-light_whiter hover:border-light_whiter dark:bg-dark_grey dark:border-dark_grey dark:text-dark_text_white dark:hover:bg-dark_light_grey"
				>Back to community</button
			>
		</a>
		{#if session?.user}
			<a href="/dashboard">
				<button
					class="duration-100 shadow-md btn hover:bg-light_whiter hover:border-light_whiter dark:bg-dark_grey dark:border-dark_grey dark:text-dark_text_white dark:hover:bg-dark_light_grey"
					>Back to dashboard</button
				>
			</a>
		{/if}
	</div>
{/if}
<Space gap={20} />
