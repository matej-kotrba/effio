<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { testObject } from '~stores/testObject';
	import { answerSchema } from '~schemas/textInput';
	import { applicationStates } from '~stores/applicationStates';
	import RemoveButton from '../creatorUtils/RemoveButton.svelte';
	import { dropdown } from '~use/dropdown';

	export let indexParent: number;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as PickOneQuestion;
	$: answersLength = content.answers.length;

	$: isDarkMode = $applicationStates.darkMode.isDarkMode;

	const QUESTION_LIMIT = 10;

	function newQuestionConditionCheck() {
		return !(content.answers.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		if (
			($testObject.questions[indexParent].content as PickOneQuestion).answers
		) {
			($testObject.questions[indexParent].content as PickOneQuestion).answers =
				[...content.answers, { answer: '' }];
		}
	}

	function deleteQuestion(index: number) {
		($testObject.questions[indexParent].content as PickOneQuestion).answers =
			content.answers.filter((_, i) => i !== index);
		if (content['correctAnswerIndex'] === index)
			(
				$testObject.questions[indexParent].content as PickOneQuestion
			).correctAnswerIndex = 0;
		toast.success(`Question ${index + 1} deleted`);
	}
</script>

<form class="relative flex flex-col gap-4">
	<!-- Display a limit of the questions -->
	<div class="flex justify-end">
		<div class="flex gap-1">
			{#key answersLength}
				<div
					class={answersLength === QUESTION_LIMIT
						? 'text-error dark:text-dark_error'
						: 'text-light_primary dark:text-dark_primary'}
					in:fly={{ x: 0, y: -20 }}
				>
					{answersLength}
				</div>
			{/key}
			/ {QUESTION_LIMIT}
		</div>
	</div>
	<!-- Display the input fields with control -->
	{#each content?.answers || [] as q, index (q)}
		<div class="flex flex-col gap-2" animate:flip={{ duration: 200 }}>
			<div>
				<div class="flex">
					<RemoveButton
						deleteQuestion={() => deleteQuestion(index)}
						questionLength={content.answers.length}
					/>
					<div class="relative grow-[1]">
						<TextInput
							title="Option {index + 1}"
							titleName="Option {index + 1}"
							validationSchema={answerSchema}
							on:error={(event) =>
								(content.answers[index].error = event.detail)}
							bind:inputValue={content.answers[index].answer}
						/>
					</div>
					<!-- data-tip="Mark this as a correct answer" -->
					<button
						type="button"
						use:dropdown={'Mark this as a correct answer'}
						class={`px-2 grid tooltip place-content-center rounded-r-md`}
						style={`${
							index === content.correctAnswerIndex
								? `background-color: var(--success); color: var(${
										isDarkMode ? '--dark_black' : '--light-white'
								  });`
								: `background-color: var(${
										isDarkMode ? '--dark_black' : '--light-white'
								  }); color: var(${
										isDarkMode ? '--dark-text-white' : '--success'
								  });`
						}}`}
						on:click={() => (content['correctAnswerIndex'] = index)}
					>
						<Icon icon="charm:tick" class="text-3xl" />
					</button>
				</div>
				<p
					class={`text-body2 text-error dark:text-dark_error ${
						!content.answers[index].error ? 'opacity-0' : ''
					}`}
				>
					{content.answers[index].error || 'Placeholder error'}
				</p>
			</div>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
	<!-- <Toaster /> -->
</form>
