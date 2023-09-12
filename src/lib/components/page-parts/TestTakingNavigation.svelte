<script lang="ts">
	import { testObject } from '~stores/testObject';
	import { fade } from 'svelte/transition';
	import type { Session } from '@auth/core/types';
	import Space from '~components/separators/Space.svelte';

	export let session: Session | null = null;

	export let result: QuestionServerCheckResponse<QuestionContent>[] | null =
		null;

	export let questionContainerRef: HTMLDivElement | null = null;
	export let maxPoints: number | null = null;
	export let userPoints: number | null = null;
	export let mark: string | null = null;

	export let markedIndex: number | null = null;

	function navigateToQuestion(index: number) {
		if (!questionContainerRef) return;
		markedIndex = index;
		window.scrollTo({
			top:
				questionContainerRef.children[index].getBoundingClientRect().top +
				window.scrollY -
				100,
			behavior: 'smooth'
		});
	}
</script>

{#if result}
	<div class="mb-2">
		{#if maxPoints !== null && userPoints !== null && mark !== null}
			<h3 class="text-h4">
				Your result is: <span class="font-semibold">{mark}</span>, {userPoints}/{maxPoints}
				- {(userPoints / maxPoints || 0) * 100}%
			</h3>
		{:else}
			<h3 class="text-h4">Your results</h3>
		{/if}
		<Space gap={5} />
		<div class="flex gap-1">
			{#each result as question, index}
				<button
					type="button"
					on:click={() => navigateToQuestion(index)}
					class="relative z-[100] w-16 text-2xl font-bold rounded-md shadow-md lg:tooltip bg-light_whiter aspect-square dark:bg-dark_grey dark:hover:bg-dark_light_grey hover:bg-light_white"
					data-tip="Go to {$testObject.questions[index].title}"
				>
					<div class="absolute top-0 right-0 text-xl">
						{#if question.isCorrect}
							<iconify-icon
								icon="ic:round-check"
								class="text-xl text-green-500"
							/>
						{:else}
							<iconify-icon
								icon="ic:round-close"
								class="text-xl text-red-600"
							/>
						{/if}
					</div>
					{index + 1}
				</button>
			{/each}
		</div>
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
