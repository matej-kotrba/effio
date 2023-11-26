<script lang="ts">
	import { onMount } from 'svelte';

	import TextInput from '~components/inputs/TextInput.svelte';
	import { questionContentFunctions } from '~helpers/test';
	import { answerSchema } from '~schemas/textInput';
	import { testObject } from '~stores/testObject';

	let content = $testObject.questions[0].content as ProgrammingQuestion;

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
		on:error={(event) => (content.answers[index].error = event.detail)}
		bind:inputValue={content.answers[index].answer}
	/>
</div>
