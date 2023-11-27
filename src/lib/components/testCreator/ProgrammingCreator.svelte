<script lang="ts">
	import { onMount } from 'svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import Space from '~components/separators/Space.svelte';
	import { questionContentFunctions } from '~helpers/test';
	import {
		answerSchema,
		programminDescriptionSchema
	} from '~schemas/textInput';
	import { testObject } from '~stores/testObject';

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
	<TextInputSimple
		title="Describe what the code should do"
		titleName="description"
		validationSchema={programminDescriptionSchema}
		displayOutside={true}
		on:error={(event) => (content['errors']['description'] = event.detail)}
		bind:inputValue={content['description']}
	/>
</div>
