<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { getTestObject } from '~stores/testObject';
	import { answerSchema } from '~schemas/testValidation';
	import { applicationStates } from '~stores/applicationStates';
	import RemoveButton from '../creatorUtils/RemoveButton.svelte';
	import CommentEnhance from '../creatorUtils/CommentEnhance.svelte';
	import * as Tooltip from '~components/ui/tooltip';

	export let indexParent: number;

	const testObject = getTestObject();

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as PickOneQuestion;
	$: answersLength = content.answers.length;

	$: isDarkMode = $applicationStates.darkMode.isDarkMode;

	$: {
		if (content) {
			for (const answer of content.answers) {
				answer.id = content.answers.indexOf(answer);
			}
		}
	}

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
				[...content.answers, { answer: '', id: content.answers.length }];
		}
	}

	function deleteQuestion(index: number) {
		($testObject.questions[indexParent].content as PickOneQuestion).answers =
			content.answers.filter((_, i) => i !== index);
		if (content['correctAnswerId'] === index)
			(
				$testObject.questions[indexParent].content as PickOneQuestion
			).correctAnswerId = 0;
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
					<div class="grow-[1]">
						<CommentEnhance asnwerPath={q} displayType="up">
							<TextInput
								title="Option {index + 1}"
								titleName="Option {index + 1}"
								validationSchema={answerSchema}
								on:error={(event) =>
									(content.answers[index].error = event.detail)}
								bind:inputValue={content.answers[index].answer}
							/>
						</CommentEnhance>
					</div>
					<!-- use:dropdown={'Mark this as a correct answer'} -->
					<Tooltip.Root openDelay={300}>
						<Tooltip.Trigger>
							<button
								type="button"
								class={`px-2 h-full grid place-content-center rounded-r-md`}
								style={`${
									q.id === content.correctAnswerId
										? `background-color: var(--success); color: var(${
												isDarkMode ? '--dark_black' : '--light-white'
										  });`
										: `background-color: var(${
												isDarkMode ? '--dark_black' : '--light-white'
										  }); color: var(${
												isDarkMode ? '--dark-text-white' : '--success'
										  });`
								}}`}
								on:click={() => (content['correctAnswerId'] = q.id)}
							>
								<Icon icon="charm:tick" class="text-3xl" />
							</button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<span> Mark as correct </span>
						</Tooltip.Content>
					</Tooltip.Root>
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
</form>
