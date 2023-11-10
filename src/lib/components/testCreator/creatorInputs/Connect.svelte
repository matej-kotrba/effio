<script lang="ts">
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { testObject } from '~stores/testObject';
	import { answerSchema } from '~schemas/textInput';
	import RemoveButton from '../creatorUtils/RemoveButton.svelte';

	export let indexParent: number;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as ConnectQuestion;
	$: answersLength = content.answers.length;

	const QUESTION_LIMIT = 10;

	$: answerKeys = Object.keys(content.matchedAnswers) as string[];
	$: (
		$testObject.questions[indexParent].content as ConnectQuestion
	).answers.forEach((answer, index) => {
		answer.matchedAnswerIndex = answerKeys[index];
	}),
		answersLength;

	function newQuestionConditionCheck() {
		return !(content.answers.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		if (
			($testObject.questions[indexParent].content as ConnectQuestion).answers
		) {
			(
				$testObject.questions[indexParent].content as ConnectQuestion
			).matchedAnswers[crypto.randomUUID()] = {
				answer: ''
			};
			($testObject.questions[indexParent].content as ConnectQuestion).answers =
				[...content.answers, { answer: '', matchedAnswerIndex: undefined }];
		}
	}

	function deleteQuestion(index: number) {
		($testObject.questions[indexParent].content as ConnectQuestion).answers =
			content.answers.filter((_, i) => i !== index);
		delete ($testObject.questions[indexParent].content as ConnectQuestion)
			.matchedAnswers[answerKeys[index]];
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
					<div class="relative grow-[1] grid grid-cols-2 gap-1">
						<TextInput
							title="Option {index + 1}"
							titleName="Option {index + 1}"
							validationSchema={answerSchema}
							on:error={(event) =>
								(content.answers[index].error = event.detail)}
							bind:inputValue={content.answers[index].answer}
						/>
						<!-- customStyles={'rounded-t-none rounded-b-md'}
							customContainerStyles={'border-t-[0.125rem] border-b-0 before:top-[-0.125rem]'} -->
						<TextInput
							title="Option matched {index + 1}"
							titleName="Matched option {index + 1}"
							validationSchema={answerSchema}
							on:error={(event) => {
								content.matchedAnswers[
									Object.keys(content.matchedAnswers)[index]
								].error = event.detail;
							}}
							bind:inputValue={content.matchedAnswers[answerKeys[index]].answer}
						/>
					</div>
				</div>
				<p
					class={`text-body2 text-error dark:text-dark_error ${
						!content.answers[index].error &&
						!content.matchedAnswers[Object.keys(content.matchedAnswers)[index]]
							.error
							? 'opacity-0'
							: ''
					}`}
				>
					{content.answers[index].error ||
						content.matchedAnswers[Object.keys(content.matchedAnswers)[index]]
							.error ||
						'Placeholder error'}
				</p>
			</div>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
	<Toaster />
</form>
