<script lang="ts">
	import { onMount } from 'svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import Space from '~components/separators/Space.svelte';
	import { questionContentFunctions } from '~helpers/test';
	import {
		PROGRAMMING_DESCRIPTION_MAX,
		PROGRAMMING_DESCRIPTION_MIN,
		answerSchema,
		programminDescriptionSchema
	} from '~schemas/textInput';
	import { testObject } from '~stores/testObject';
	import InputOutputSetter from './programmingCreator/InputOutputSetter.svelte';

	// Programming question can only be one on in the creator, that's why we use 0 as index
	const INDEX_OF_QUESTION = 0;

	$testObject.questions = [];
	$testObject.questions.push({
		content: questionContentFunctions['programming']['createNew'](),
		title: '',
		id: crypto.randomUUID(),
		points: 2,
		questionType: 'programming',
		displayType: 'Programming',
		questionTypeId: '',
		errors: {}
	});

	$: content = $testObject.questions[INDEX_OF_QUESTION]
		.content as ProgrammingQuestion;

	onMount(() => {
		return () => {
			$testObject.questions = [];
		};
	});
</script>

<div>
	<TextInputSimple
		inputProperties={{ placeholder: 'Program a cute seal' }}
		title="Code name"
		titleName="codeName"
		validationSchema={answerSchema}
		displayOutside={true}
		on:error={(event) =>
			($testObject.questions[INDEX_OF_QUESTION]['errors']['title'] =
				event.detail)}
		bind:inputValue={$testObject.questions[INDEX_OF_QUESTION]['title']}
	/>
	<Space gap={10} />
	<TextAreaInput
		inputProperties={{
			placeholder: 'This code should create a really nice seal ...'
		}}
		title="Describe what the code should do"
		titleName="description"
		validationSchema={programminDescriptionSchema}
		doesLimit={true}
		min={PROGRAMMING_DESCRIPTION_MIN}
		max={PROGRAMMING_DESCRIPTION_MAX}
		customStyles="text-body2"
		on:error={(event) => (content['errors']['description'] = event.detail)}
		bind:inputValue={content['description']}
	/>
	<div class="mt-4">
		<h5 class="text-h5">Tests</h5>
		<span
			class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
			>* For sake of your task you should create as many test with as many edge
			cases as possible</span
		>
		<div>
			<InputOutputSetter questionIndex={INDEX_OF_QUESTION} />
		</div>
	</div>
</div>
