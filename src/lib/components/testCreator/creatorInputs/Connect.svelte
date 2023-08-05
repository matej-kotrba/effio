<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { testObject } from '~stores/testObject';
	import { asnwerSchema } from '~schemas/textInput';

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

	$: console.log($testObject);

	function newQuestionConditionCheck() {
		return !(content.answers.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		if ($testObject.questions[indexParent].content.answers) {
			(
				$testObject.questions[indexParent].content as ConnectQuestion
			).matchedAnswers[crypto.randomUUID()] = '';
			($testObject.questions[indexParent].content as ConnectQuestion).answers =
				[...content.answers, { answer: '', matchedAnswerIndex: undefined }];
		}
	}

	function deleteQuestion(index: number) {
		// $testObject.questions[indexParent].content.answers = content.answers.filter(
		// 	(_, i) => i !== index
		// );
		// if (content['correctAnswerIndex'] === index)
		// 	(
		// 		$testObject.questions[indexParent].content as PickOneQuestion
		// 	).correctAnswerIndex = 0;
		// toast.success(`Question ${index + 1} deleted`);
	}
</script>

<form class="relative flex flex-col gap-4">
	<!-- Display a limit of the questions -->
	<div class="flex justify-end">
		<div class="flex gap-1">
			{#key answersLength}
				<div
					class={answersLength === QUESTION_LIMIT
						? 'text-error'
						: 'text-light_primary'}
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
					<button
						type="button"
						data-tip="Delete answer"
						class={`tooltip grid px-2 group place-content-center bg-light_white text-error hover:bg-error hover:text-white rounded-l-md ${
							!(content.answers.length > 2)
								? 'text-gray-500 hover:text-gray-500 hover:bg-light_white'
								: ''
						}`}
						disabled={!(content.answers.length > 2)}
						style="transition: 200ms background-color, 200ms color;"
						on:click={() => deleteQuestion(index)}
					>
						<Icon
							icon="material-symbols:close-rounded"
							class="text-3xl group-hover:rotate-90"
							style="transition: 200ms transform;"
						/>
					</button>
					<div class="relative grow-[1] grid grid-cols-2 gap-1">
						<TextInput
							title="Option {index + 1}"
							titleName="Option {index + 1}"
							validationSchema={asnwerSchema}
							on:error={(event) =>
								(content.answers[index].error = event.detail)}
							bind:inputValue={content.answers[index].answer}
						/>
						<!-- customStyles={'rounded-t-none rounded-b-md'}
							customContainerStyles={'border-t-[0.125rem] border-b-0 before:top-[-0.125rem]'} -->
						<TextInput
							title="Option matched {index + 1}"
							titleName="Matched option {index + 1}"
							validationSchema={asnwerSchema}
							on:error={(event) =>
								(content.answers[index].error = event.detail)}
							bind:inputValue={content.matchedAnswers[answerKeys[index]]}
						/>
					</div>
				</div>
				<p
					class={`text-body2 text-error ${
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
	<Toaster />
</form>
