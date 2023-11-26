<script lang="ts">
	import { onMount } from 'svelte';

	import TextInput from '~components/inputs/TextInput.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { questionContentFunctions } from '~helpers/test';
	import {
		answerSchema,
		programminDescriptionSchema
	} from '~schemas/textInput';
	import { testObject } from '~stores/testObject';

	// Programming question can only be one on in the creator, that's why we use 0 as index
	const INDEX_OF_QUESTION = 0;

	let content = $testObject.questions[INDEX_OF_QUESTION]
		.content as ProgrammingQuestion;

	onMount(() => {
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

		return () => {
			$testObject.questions = [];
		};
	});
</script>

<div>
	<TextInput
		title="Code name"
		titleName="codeName"
		validationSchema={answerSchema}
		on:error={(event) =>
			($testObject.questions[INDEX_OF_QUESTION]['errors']['title'] =
				event.detail)}
		bind:inputValue={$testObject.questions[INDEX_OF_QUESTION]['title']}
	/>
	<TextInputSimple
		title="Describe what the code should do"
		titleName="description"
		validationSchema={programminDescriptionSchema}
		on:error={(event) => (content['errors']['description'] = event.detail)}
		bind:inputValue={content['description']}
		displayOutside={true}
	/>
</div>
