<script lang="ts">
	import { fade } from 'svelte/transition';
	import Separator from '~components/separators/Separator.svelte';
	import { questionContentFunctions } from '~helpers/test/questionFunctions';
	import type { TestObject } from '~stores/testObject';
	import { clickOutside } from '~use/clickOutside';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<FillQuestion> | null =
		null;
	export let testObject: TestObject;

	let showedAnswerIndex: number | undefined = undefined;

	$: content = testObject.questions[questionIndex].content as FillQuestion;
</script>

<div>
	{#each content['answers'] as question, index}
		<span>{question.answer.precedent}</span>
		<!-- <TextInputSimple
			title="Your answer"
			inputProperties={{ disabled: !!resultFormat }}
			titleName="{testObject.questions[questionIndex]['title']}{questionIndex}"
			bind:inputValue={question['answer']['options'][index]}
		/> -->
		<div class="dropdown dropdown-hover">
			{#if resultFormat && !questionContentFunctions['fill']['checkOptionCorrectness'](resultFormat.userAnswer.answers[index].answer.options[0], resultFormat.correctAnswer.answers[index].answer.options)}
				<button
					type="button"
					on:click={() => (showedAnswerIndex = index)}
					class="absolute p-1 translate-y-1/2 bg-white dark:bg-dark_quaternary rounded-full shadow-md right-2 bottom-[90%]"
				>
					<iconify-icon
						icon="material-symbols:question-mark"
						class="grid text-xl place-content-center"
					/>
				</button>
				{#if showedAnswerIndex === index}
					<div
						use:clickOutside
						on:clickoutside={() => (showedAnswerIndex = undefined)}
						transition:fade={{ duration: 100 }}
						class="absolute w-full max-w-[60rem] break-words hyphens-auto bottom-[110%] left-1/2 -translate-x-1/2 text-body2 bg-light_grey dark:bg-dark_quaternary p-1 rounded-md"
					>
						<span class="font-semibold">Correct answers</span>
						<p>
							{resultFormat['correctAnswer']['answers'][index]['answer'][
								'options'
							].join(', ')}
						</p>
					</div>
				{/if}
			{/if}
			<input
				bind:value={question['answer']['options'][0]}
				class={`border-2 border-solid w-40 px-1 py-1 my-1
		 overflow-hidden duration-150 bg-white  rounded-md shadow-lg dark:bg-dark_light_grey
		 overflow-ellipsis text-light_text_black dark:text-dark_text_white outline-1 outline-transparent outline
		 focus-within:outline-light_primary dark:focus-within:outline-dark_primary
		 ${
				resultFormat
					? questionContentFunctions['fill']['checkOptionCorrectness'](
							resultFormat.userAnswer.answers[index].answer.options[0],
							resultFormat.correctAnswer.answers[index].answer.options
					  )
						? 'border-success'
						: 'border-error dark:border-dark_error'
					: 'border-transparent'
			}`}
				disabled={!!resultFormat}
			/>
			{#if resultFormat && resultFormat.correctAnswer.answers[index].response && (showedAnswerIndex === undefined || showedAnswerIndex === index)}
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					tabindex="0"
					class="dropdown-content px-2 py-1 z-[1] menu p-2 shadow-md bg-light_grey dark:bg-dark_quaternary rounded-md w-full max-w-[72rem]"
				>
					<span>Comment</span>
					<Separator w={'100%'} h={'1px'} class="mb-1" />
					<p
						class="break-words rounded-lg hyphens-auto text-light_text_black dark:text-dark_text_white"
					>
						{resultFormat.correctAnswer.answers[index].response}
						<!-- {resultFormat['correctAnswer']['answers'][index]['answer'][
							'options'
						].join(', ')} -->
					</p>
				</div>
			{/if}
		</div>
		<!-- {#if resultFormat && resultFormat['isCorrect'] === false}
			<p class="p-2 rounded-md bg-error dark:bg-dark_error">
				{resultFormat.correctAnswer.answers
					.map((item) => item['answer']['options'])
					.join(', ')}
			</p>
		{/if} -->
		<span>{question.answer.sequent}</span>
	{/each}
</div>
