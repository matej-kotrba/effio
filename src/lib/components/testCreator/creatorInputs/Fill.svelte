<script lang="ts">
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast, { Toaster } from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { testObject } from '~stores/testObject';
	import {
		WRITE_AMSWER_MAX,
		WRITE_ANSWER_MIN,
		writeAnswerSchema
	} from '~schemas/textInput';

	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import RemoveButton from '../creatorUtils/RemoveButton.svelte';
	import Separator from '~components/separators/Separator.svelte';

	export let indexParent: number;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as FillQuestion;
	$: answersLength = content.answers.length;

	$: console.log($testObject.questions[indexParent].content.answers);

	const QUESTION_LIMIT = 10;

	function newQuestionConditionCheck() {
		return !(content.answers.length >= QUESTION_LIMIT);
	}

	function onAddNew() {
		if (!newQuestionConditionCheck()) {
			toast.error('You have reached the limit of questions: ' + QUESTION_LIMIT);
			return;
		}
		// if ($testObject.questions[indexParent].content.answers) {
		// 	$testObject.questions[indexParent].content.answers = [
		// 		...content.answers,
		// 		{ answer: '' }
		// 	];
		// }
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
				<p>Part {index + 1}</p>
				<Separator w="100%" h="2px" color="var(--dark-text-white-20)" />
				<div class="flex flex-col items-start gap-1">
					<!-- <RemoveButton
						questionLimit={1}
						deleteQuestion={() => deleteQuestion(index)}
						questionLength={answersLength}
						class="w-10 h-10 rounded-full"
					/> -->
					<TextInputSimple
						title="Precedent"
						titleName="precedentAnswer{indexParent}"
						max={WRITE_AMSWER_MAX}
						min={WRITE_ANSWER_MIN}
						validationSchema={writeAnswerSchema}
						doesLimit={true}
						inputProperties={{
							placeholder: 'Your precedent ...'
						}}
						on:error={(e) => {
							content.answers[index].answer['errors']['precedent'] = e.detail;
						}}
						bind:inputValue={content.answers[index].answer.precedent}
					/>
					<p
						class={`text-body2 text-error dark:text-dark_error ${
							!content.answers[index].answer.errors['precedent']
								? 'opacity-0'
								: ''
						}`}
					>
						{content.answers[index].answer.errors['precedent'] ||
							'Placeholder error'}
					</p>
					{#each content['answers'][index]['answer']['options'] as option, idx}
						<TextInputSimple
							title="Answer option {idx + 1}"
							titleName="fillAnswer{crypto.randomUUID()}"
							max={WRITE_AMSWER_MAX}
							min={WRITE_ANSWER_MIN}
							validationSchema={writeAnswerSchema}
							doesLimit={true}
							inputProperties={{
								placeholder: 'Your answer option ...'
							}}
							on:error={(e) => {
								content.answers[index].answer['errors']['options'][idx] =
									e.detail;
							}}
							bind:inputValue={content.answers[index].answer['options'][idx]}
						/>
						<p
							class={`text-body2 text-error dark:text-dark_error ${
								!content.answers[index].answer.errors.options[idx]
									? 'opacity-0'
									: ''
							}`}
						>
							{content.answers[index].answer.errors.options[idx] ||
								'Placeholder error'}
						</p>
					{/each}
					<div class="mx-auto">
						<AddNew onClick={onAddNew} />
					</div>
					<TextInputSimple
						title="Sequent"
						titleName="sequentAnswer{indexParent}"
						max={WRITE_AMSWER_MAX}
						min={WRITE_ANSWER_MIN}
						validationSchema={writeAnswerSchema}
						doesLimit={true}
						inputProperties={{
							placeholder: 'Your sequence ...'
						}}
						on:error={(e) => {
							content.answers[index].answer['errors']['sequent'] = e.detail;
						}}
						bind:inputValue={content.answers[index].answer.sequent}
					/>
					<p
						class={`text-body2 text-error dark:text-dark_error ${
							!content.answers[index].answer.errors['sequent']
								? 'opacity-0'
								: ''
						}`}
					>
						{content.answers[index].answer.errors['sequent'] ||
							'Placeholder error'}
					</p>
				</div>
				<!-- <p
					class={`text-body2 text-error dark:text-dark_error ${
						!content.answers[index].answer ? 'opacity-0' : ''
					}`}
				>
					{content.answers[index].error || 'Placeholder error'}
				</p> -->
				<Separator w="100%" h="2px" color="var(--dark-text-white-20)" />
			</div>
		</div>
	{/each}
	<div class="flex justify-center">
		<AddNew onClick={onAddNew} />
	</div>
	<Toaster />
</form>
