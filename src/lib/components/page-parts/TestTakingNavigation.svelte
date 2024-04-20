<script lang="ts">
	import { getTestObject } from '~stores/testObject';
	import { fade } from 'svelte/transition';
	import type { Session } from '@auth/core/types';
	import Space from '~components/separators/Space.svelte';
	import * as Tooltip from '~components/ui/tooltip/index';
	import IconButton from '~components/buttons/IconButton.svelte';
	import { goto } from '$app/navigation';

	const testObject = getTestObject();

	export let session: Session | null = null;

	export let result: QuestionServerCheckResponse<QuestionContent>[] | null =
		null;

	export let questionContainerRef: HTMLDivElement | null = null;
	export let maxPoints: number | null = null;
	export let userPoints: number | null = null;
	export let mark: string | null = null;

	export let markedIndex: number | null = null;

	export let premarkText: string = 'Your result is: ';

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
		<div class="flex gap-1" in:fade>
			<IconButton
				onClick={() => {
					goto('/community');
				}}
				icon="fluent:people-community-24-filled"
				buttonClasses="text-2xl"
				class="p-3"
				tooltip="Go to community"
			/>
			{#if session?.user}
				<IconButton
					onClick={() => {
						goto('/dashboard');
					}}
					icon="foundation:graph-pie"
					buttonClasses="text-2xl"
					class="p-3"
					tooltip="Go to dashboard"
				/>
			{/if}
		</div>
		{#if maxPoints !== null && userPoints !== null}
			<h3 class="text-h4">
				{premarkText}<span class="font-semibold">{mark || ''}</span>, {userPoints}/{maxPoints}
				- {((userPoints / maxPoints || 0) * 100).toFixed(2)}%
			</h3>
		{:else}
			<h3 class="text-h4">Your results</h3>
		{/if}
		<Space gap={5} />
		<div class="flex gap-1">
			{#each result as question, index}
				<Tooltip.Root openDelay={300}>
					<Tooltip.Trigger>
						<button
							type="button"
							on:click={() => navigateToQuestion(index)}
							class="relative z-[100] w-16 text-2xl font-bold rounded-md shadow-md lg:tooltip bg-light_whiter aspect-square dark:bg-dark_grey dark:hover:bg-dark_light_grey hover:bg-light_white"
						>
							<div class="absolute top-0 right-0 text-xl">
								{#if question.isCorrect === true}
									<iconify-icon
										icon="ic:round-check"
										class="text-xl text-green-500"
									/>
								{:else if question.isCorrect === 'partial'}
									<iconify-icon
										icon="material-symbols:stroke-partial"
										class="text-xl text-warning"
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
					</Tooltip.Trigger>

					<Tooltip.Content>
						Go to {$testObject.questions[index].title}
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</div>
{/if}
<Space gap={20} />
