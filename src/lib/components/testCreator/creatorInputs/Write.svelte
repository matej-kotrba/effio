<script lang="ts">
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { getTestObject } from '~stores/testObject';
	import {
		WRITE_AMSWER_MAX,
		WRITE_ANSWER_MIN,
		writeAnswerSchema
	} from '~schemas/testValidation';

	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import RemoveButton from '../creatorUtils/RemoveButton.svelte';
	import CommentEnhance from '../creatorUtils/CommentEnhance.svelte';

	export let indexParent: number;

	const testObject = getTestObject();

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as WriteQuestion;
	$: answersLength = content.answers.length;

	const QUESTION_LIMIT = 10;

	function newQuestionConditionCheck() {
		return !(content.answers.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		if (($testObject.questions[indexParent].content as WriteQuestion).answers) {
			($testObject.questions[indexParent].content as WriteQuestion).answers = [
				...content.answers,
				{ answer: '', id: content.answers.length }
			];
		}
	}

	function deleteQuestion(index: number) {
		($testObject.questions[indexParent].content as WriteQuestion).answers =
			content.answers.filter((_, i) => i !== index);
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
	<CommentEnhance
		asnwerPath={content.answers[0]}
		displayType="up"
		staticDisplay={true}
	>
		{#each content?.answers || [] as q, index (q)}
			<div class="flex flex-col gap-2" animate:flip={{ duration: 200 }}>
				<div>
					<div class="flex w-full gap-1">
						<RemoveButton
							questionLimit={1}
							deleteQuestion={() => deleteQuestion(index)}
							questionLength={answersLength}
							class="rounded-sm"
						/>
						<TextInputSimple
							title="Answer option {index + 1}"
							titleName="titleAnswer{indexParent}"
							max={WRITE_AMSWER_MAX}
							min={WRITE_ANSWER_MIN}
							validationSchema={writeAnswerSchema}
							containerClasses={'w-full'}
							doesLimit={true}
							inputProperties={{
								placeholder: 'Your answer option...'
							}}
							class="w-full rounded-sm"
							on:error={(e) => {
								content.answers[index].error = e.detail;
							}}
							bind:inputValue={content.answers[index].answer}
						/>
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
	</CommentEnhance>
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
</form>
