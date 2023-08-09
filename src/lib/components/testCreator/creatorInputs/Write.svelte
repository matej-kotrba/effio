<script lang="ts">
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { testObject } from '~stores/testObject';
	import { WRITE_AMSWER_MAX, WRITE_ANSWER_MIN } from '~schemas/textInput';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';

	export let indexParent: number;

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
		if ($testObject.questions[indexParent].content.answers) {
			$testObject.questions[indexParent].content.answers = [
				...content.answers,
				{ answer: '' }
			];
		}
	}

	function deleteQuestion(index: number) {
		$testObject.questions[indexParent].content.answers = content.answers.filter(
			(_, i) => i !== index
		);
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
					<TextInputSimple
						title="Answer option {index + 1}"
						titleName="titleAnswer{indexParent}"
						max={WRITE_AMSWER_MAX}
						min={WRITE_ANSWER_MIN}
						doesLimit={true}
						on:error={(e) => {
							$testObject.questions[indexParent].content.answers[index].error =
								e.detail;
						}}
						bind:inputValue={$testObject.questions[indexParent].content.answers[
							index
						].answer}
					/>
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
