<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<FillQuestion> | null =
		null;

	console.log(questionIndex);
	$: content = $testObject.questions[questionIndex].content as FillQuestion;
</script>

<div>
	{#each content['answers'] as question, index}
		<span>{question.answer.precedent}</span>
		<!-- <TextInputSimple
			title="Your answer"
			inputProperties={{ disabled: !!resultFormat }}
			titleName="{$testObject.questions[questionIndex]['title']}{questionIndex}"
			bind:inputValue={question['answer']['options'][index]}
		/> -->
		<div class="dropdown dropdown-hover">
			<button tabindex="0">
				<input
					bind:value={question['answer']['options'][0]}
					class={`border-2 border-solid border-transparent w-40 px-1 py-1 my-1
		 overflow-hidden duration-150 bg-white rounded-md shadow-lg dark:bg-dark_light_grey
		 overflow-ellipsis text-light_text_black dark:text-dark_text_white outline-1 outline-transparent outline
		 focus-within:outline-primary dark:focus-within:outline-dark_primary
		 ${
				resultFormat
					? resultFormat['isCorrect']
						? 'border-success'
						: 'border-error dark:border-dark_error'
					: 'border-transparent'
			}`}
					disabled={!!resultFormat}
				/>
			</button>
			{#if resultFormat}
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content z-[1] menu p-2 shadow-dark_text_white_20 shadow-sm bg-light_white dark:bg-dark_quaternary rounded-md w-52"
				>
					<li
						class="px-2 py-1 rounded-lg text-light_text_black dark:text-dark_text_white"
					>
						{resultFormat['correctAnswer']['answers'][index]['answer'][
							'options'
						].join(', ')}
					</li>
				</ul>
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
