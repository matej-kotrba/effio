<script lang="ts">
	import Icon from '@iconify/svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import AddNew from '../creatorUtils/AddNew.svelte';
	import { flip } from 'svelte/animate';
	import toast from 'svelte-french-toast';
	import { fly } from 'svelte/transition';
	import { getTestObject } from '~stores/testObject';
	import { answerSchema } from '~schemas/textInput';
	import { applicationStates } from '~stores/applicationStates';
	import RemoveButton from '../creatorUtils/RemoveButton.svelte';
	import CommentEnhance from '../creatorUtils/CommentEnhance.svelte';
	import {
		ALLOWED_IMAGE_TYPES,
		IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB
	} from '~helpers/constants';
	import { onMount } from 'svelte';
	import { setImageUpload } from '../../inputs/ImageImportV2.svelte';

	export let indexParent: number;

	export let maxImageSizeInMB = IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB;

	const testObject = getTestObject();

	let imageRef: HTMLImageElement;
	let uploadedImageUrl: string | null = null;

	// Reference to the test object content
	$: content = $testObject.questions[indexParent].content as ImageQuestion;
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
		if (($testObject.questions[indexParent].content as ImageQuestion).answers) {
			($testObject.questions[indexParent].content as ImageQuestion).answers = [
				...content.answers,
				{ answer: '', id: content.answers.length }
			];
		}
	}

	function deleteQuestion(index: number) {
		($testObject.questions[indexParent].content as ImageQuestion).answers =
			content.answers.filter((_, i) => i !== index);
		if (content['correctAnswerId'] === index)
			(
				$testObject.questions[indexParent].content as ImageQuestion
			).correctAnswerId = 0;
		toast.success(`Question ${index + 1} deleted`);
	}

	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (imageRef === null) return;
		setImageUpload(
			e,
			ALLOWED_IMAGE_TYPES,
			maxImageSizeInMB,
			(file, resultUrl) => {
				content.imageFile = file;
				uploadedImageUrl = resultUrl;
			}
		);
	}

	onMount(() => {
		if (content.imageFile instanceof File) {
			const reader = new FileReader();
			reader.readAsDataURL(content.imageFile);
			reader.onload = () => {
				uploadedImageUrl = reader.result as string;
			};
		}
	});
</script>

<form class="relative flex flex-col gap-4">
	<div
		class="relative grid w-full border-2 border-black border-dashed aspect-video place-content-center"
	>
		<input
			type="file"
			name="image-upload-{indexParent}"
			id="image-upload-{indexParent}"
			accept={ALLOWED_IMAGE_TYPES.map((name) => `image/${name}`).join(', ')}
			class="absolute w-full h-full opacity-0 cursor-pointer"
			on:change={onImageUpload}
		/>
		<div
			class="absolute w-full h-full overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-md pointer-events-none left-1/2 top-1/2"
		>
			<img
				bind:this={imageRef}
				src={uploadedImageUrl || content.imageUrl}
				alt="Group icon"
				class="object-cover w-full h-full text-transparent"
			/>
		</div>
		<iconify-icon icon="ph:image-light" class="mx-auto text-4xl" />
		<span>Upload image</span>
	</div>
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
					<button
						type="button"
						data-tip="Mark this as a correct answer"
						class={`px-2 grid tooltip tooltip-left place-content-center rounded-r-md`}
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
