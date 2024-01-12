<script lang="ts">
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import Space from '~components/separators/Space.svelte';
	import { questionContentFunctions } from '~helpers/test/questionFunctions';
	import {
		PROGRAMMING_DESCRIPTION_MAX,
		PROGRAMMING_DESCRIPTION_MIN,
		PROGRAMMING_TEST_MAX,
		PROGRAMMING_TEST_MIN,
		programmingDescriptionSchema,
		programmingHintSchema,
		titleSchema
	} from '~schemas/textInput';
	import { getTestObject } from '~stores/testObject';
	import InputOutputSetter from './programmingCreator/InputOutputSetter.svelte';
	import { SOURCES, dndzone } from 'svelte-dnd-action';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import type { QuestionTemplate } from '~/lib/trpc/router';

	export let programmingTemplate: QuestionTemplate;
	export let createNewQuestion: boolean = false;

	// Programming question can only be one on in the creator, that's why we use 0 as index
	const INDEX_OF_QUESTION = 0;

	const testObject = getTestObject();

	if (createNewQuestion) {
		$testObject.questions.push({
			content: questionContentFunctions['programming']['createNew'](),
			title: '',
			id: crypto.randomUUID(),
			points: 2,
			questionType: 'programming',
			displayType: 'Programming',
			questionTypeId: programmingTemplate.id,
			errors: {}
		});
	}

	// Default creation behaviour
	if ($testObject.questions.length === 0) {
		$testObject.questions.push({
			content: questionContentFunctions['programming']['createNew'](),
			title: '',
			id: crypto.randomUUID(),
			points: 2,
			questionType: 'programming',
			displayType: 'Programming',
			questionTypeId: programmingTemplate.id,
			errors: {}
		});
	} else if ($testObject.questions.length > 1) {
		$testObject.questions = [];
		$testObject.questions.push({
			content: questionContentFunctions['programming']['createNew'](),
			title: '',
			id: crypto.randomUUID(),
			points: 2,
			questionType: 'programming',
			displayType: 'Programming',
			questionTypeId: programmingTemplate.id,
			errors: {}
		});
	}

	$: content = $testObject.questions[INDEX_OF_QUESTION]
		.content as ProgrammingQuestion;

	let hints: {
		id: string;
		text: string;
	}[] = (
		$testObject.questions[INDEX_OF_QUESTION].content as ProgrammingQuestion
	).hints.map((hint) => {
		return {
			id: crypto.randomUUID(),
			text: hint
		};
	});

	$: content.hints = hints.map((hint) => hint.text);

	function addHint() {
		hints = [
			...hints,
			{
				id: crypto.randomUUID(),
				text: ''
			}
		];
	}

	function deleteHint(id: string) {
		hints = hints.filter((hint) => hint.id !== id);
	}

	let dragDisable = true;

	function onOrderChange(e: {
		detail: { items: { id: string; text: string }[]; info: { source: any } };
	}) {
		hints = e.detail.items;
		// content.hints = e.detail.items.map((item) => item.text);
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisable = true;
		}
	}

	function onOrderConsideration(e: {
		detail: { items: { id: string; text: string }[] };
	}) {
		hints = e.detail.items;
		// content.hints = e.detail.items.map((item) => item.text);
	}

	function startDrag(e: Event) {
		e.preventDefault();
		dragDisable = false;
	}
</script>

<div class="max-w-[1000px] mb-12">
	<ErrorEnhance error={$testObject.questions[INDEX_OF_QUESTION].errors.title}>
		<TextInputSimple
			inputProperties={{ placeholder: 'Program a cute seal' }}
			title="Code name"
			titleName="codeName"
			validationSchema={titleSchema}
			displayOutside={true}
			on:error={(event) =>
				($testObject.questions[INDEX_OF_QUESTION]['errors']['title'] =
					event.detail)}
			bind:inputValue={$testObject.questions[INDEX_OF_QUESTION]['title']}
		/>
	</ErrorEnhance>
	<Space gap={10} />
	<ErrorEnhance error={content.errors.description}>
		<TextAreaInput
			inputProperties={{
				placeholder: 'This code should create a really nice seal ...'
			}}
			title="Describe what the code should do"
			titleName="description"
			validationSchema={programmingDescriptionSchema}
			doesLimit={true}
			min={PROGRAMMING_DESCRIPTION_MIN}
			max={PROGRAMMING_DESCRIPTION_MAX}
			customStyles="text-body2"
			on:error={(event) => (content['errors']['description'] = event.detail)}
			bind:inputValue={content['description']}
		/>
	</ErrorEnhance>
	<div class="mt-4">
		<InputOutputSetter questionIndex={INDEX_OF_QUESTION} />
	</div>
	<div class="mt-4">
		<div class="flex items-center gap-2">
			<h5 class="text-h5">Hints</h5>
			<button
				type="button"
				on:click={addHint}
				class={`grid p-1 border-2 rounded-md bg-light_whiter dark:bg-dark_light_grey place-content-center
		 border-light_text_black_40 dark:border-dark_text_white_40 hover:bg-light_grey duration-150`}
			>
				<iconify-icon icon="ic:round-plus" class="text-3xl" />
			</button>
		</div>
		<p class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60">
			* If users run out of ideas your hints might help them
		</p>
		<div
			role="list"
			use:dndzone={{
				items: hints,
				flipDurationMs: 300,
				dragDisabled: dragDisable,
				dropTargetClasses: [
					'outline-light_primary',
					'outline-solid',
					'rounded-md'
				],
				dropTargetStyle: {
					outline: '2px dashed var(--light-primary)'
				}
			}}
			on:finalize={onOrderChange}
			on:consider={onOrderConsideration}
			on:dragover={(e) => {
				if (e?.dataTransfer?.effectAllowed) {
					e.preventDefault();
					e.dataTransfer.dropEffect = 'move';
				}
			}}
		>
			{#each hints as hint, index (hint['id'])}
				<div class="flex">
					<ErrorEnhance
						error={content['errors'].hints
							? content['errors'].hints[index]
							: undefined}
					>
						<div class="flex items-center">
							<button
								class="grid h-full place-content-center"
								on:mousedown={startDrag}
								on:touchstart={startDrag}
							>
								<iconify-icon
									icon="akar-icons:drag-horizontal"
									class="text-3xl rotate-90 text-light_text_black dark:text-dark_text_white_80"
								/>
							</button>
							<div class="relative">
								<TextInputSimple
									inputProperties={{ placeholder: 'Hint', value: hint.text }}
									title={``}
									titleName={'hint'}
									validationSchema={programmingHintSchema}
									min={PROGRAMMING_TEST_MIN}
									max={PROGRAMMING_TEST_MAX}
									displayOutside={false}
									class="max-w-[600px] w-[100vw] min-w-[240px] text-body2"
									on:error={(event) => {
										if (content['errors']['hints'] === undefined) {
											content['errors']['hints'] = [];
										}
										content['errors']['hints'][index] = event.detail;
									}}
									bind:inputValue={hint.text}
								/>
								<button
									type="button"
									on:click={() => deleteHint(hint.id)}
									class="absolute bottom-0 right-0 grid translate-y-1/2 rounded-full shadow-md bg-light_whiter dark:bg-dark_light_grey place-content-center group z-[2]"
								>
									<iconify-icon
										icon="fluent:delete-28-filled"
										class="p-1 text-2xl duration-100 group-hover:text-error dark:group-hover:text-dark_error"
									/>
								</button>
							</div>
						</div>
					</ErrorEnhance>
				</div>
			{/each}
		</div>
	</div>
</div>
