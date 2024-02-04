<script lang="ts">
	import type { TestObject } from '~stores/testObject';
	import Comment from '../Comment.svelte';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<ImageQuestion> | null =
		null;
	export let testObject: TestObject;

	$: content = testObject.questions[questionIndex].content as ImageQuestion;

	let selectedInput: number | undefined = undefined;

	// Update the store based on the selection
	$: (testObject.questions[questionIndex]['content'] as ImageQuestion)[
		'correctAnswerId'
	] =
		selectedInput !== undefined
			? (testObject.questions[questionIndex]['content'] as ImageQuestion)
					.answers[selectedInput].id
			: undefined;

	// Update the selectedInput based on the resultFormat
	$: {
		if (resultFormat) {
			selectedInput = resultFormat.userAnswer.answers.findIndex(
				(item) =>
					item.id ===
					(resultFormat as NonNullable<typeof resultFormat>).userAnswer
						.correctAnswerId
			);
		}
	}
</script>

<div class="w-full overflow-hidden max-h-[450px] rounded-xl mb-2 shadow-md">
	<img src={content.imageUrl} alt="" class="object-cover" />
</div>
<div class="flex flex-col gap-2">
	{#each content['answers'] as { answer, id }, index}
		<button
			type="button"
			disabled={!!resultFormat}
			on:click={() => (selectedInput = index)}
			class="flex justify-between px-6 py-3 duration-100 rounded-md shadow-md {resultFormat ===
				null || resultFormat.isCorrect
				? 'bg-white dark:bg-dark_light_grey'
				: ''} {!resultFormat &&
				'hover:bg-slate-50 dark:hover:bg-dark_terciary active:bg-slate-100 dark:active:bg-dark_quaternary'} 
			"
		>
			<div class="grid__container">
				<span>{answer}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if resultFormat?.isCorrect === false || resultFormat?.isCorrect === 'partial'}
					{#if resultFormat.correctAnswer.correctAnswerId === id}
						<iconify-icon
							icon="charm:tick"
							class="text-2xl text-correct dark:text-dark_correct"
						/>
					{:else}
						<iconify-icon
							icon="ic:round-close"
							class="text-2xl text-incorrect dark:text-dark_incorrect"
						/>
					{/if}
				{/if}
				<input
					type="radio"
					class="radio radio-primary dark:border-dark_primary dark:checked:bg-dark_primary radio_button"
					disabled={!!resultFormat}
					name={testObject.questions[questionIndex].title + '-radio'}
					value={index}
					bind:group={selectedInput}
				/>
			</div>
		</button>
		{#if resultFormat && resultFormat.userAnswer['correctAnswerId'] === id && resultFormat.correctAnswer.answers[index].response}
			<Comment response={resultFormat.correctAnswer.answers[id].response} />
			<!-- <p
				class="p-2 rounded-sm text-light_text_black dark:text-dark_text_white_60 bg-light_grey dark:bg-dark_light_grey"
			>
				{resultFormat.correctAnswer.answers[index].response}
			</p> -->
		{/if}
	{/each}
</div>

<style>
	:global(.dark) .radio {
		--b1: 25% 0 11;
	}
	.grid__container {
		display: grid;
		grid-template-columns: 25px 1fr;
	}
</style>
