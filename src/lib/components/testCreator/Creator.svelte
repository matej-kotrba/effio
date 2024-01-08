<script lang="ts" context="module">
	import { questionContentFunctions } from '~helpers/test/questionFunctions';

	export function createNewInput(
		input: QuestionTemplate
	): QuestionClient | void {
		const newQuestionData: PartialPick<QuestionClient, 'content'> = {
			id: crypto.randomUUID(),
			title: '',
			questionType: input.slug as QuestionClient['questionType'],
			displayType: input.name,
			questionTypeId: input.id,
			points: 2,
			errors: {}
		};

		const questionType = input.slug as QuestionClient['questionType'];

		newQuestionData.content =
			questionContentFunctions[questionType]['createNew']();

		return newQuestionData as QuestionClient;
	}
</script>

<script lang="ts">
	import Input from '~components/testCreator/Input.svelte';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import { dndzone, SOURCES } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { testObject } from '~stores/testObject';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Space from '~components/separators/Space.svelte';
	import CreatorInputSidebar from './CreatorInputSidebar.svelte';
	import CreatorInputDropdownActivator from '~components/testCreator/CreatorInputDropdownActivator.svelte';
	import toast from 'svelte-french-toast';
	import {
		QUESTION_LIMIT,
		questionMethods
	} from '~helpers/test/questionFunctions';
	import { fly } from 'svelte/transition';
	import { XL } from '~/utils/responsive';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	// Variable which stores all the inputs and display them in the dropdown (usually fetch this from the database)
	export let inputTemplates: QuestionTemplate[] = [];

	// Dropdown state
	let isDropdownOpen = false;

	// Mobile version sidebar
	let isInputSidebarOpen = false;
	let windowWidth = browser && window ? window.innerWidth : 1920;

	// Dialog controls
	let newInputOpen: () => void;
	let newInputClose: () => void;

	let inputs: HTMLDivElement[] = [];

	onMount(() => {
		function onResize() {
			windowWidth = browser && window ? window.innerWidth : 1920;
		}

		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', (e) => onResize);
		};
	});

	// Ensuring that the draggable inputs are not draggable when the user doesnt use the specific area
	let dragDisable: boolean = true;

	// THE STORE DOES IT NOW -> Stores the data of questions created, from this then will be created JSON which will be sent to the DB ❗
	// The questionsDataType can contain questions or blank object so its ready for input

	export function scrollToInput(index: number) {
		if (!inputs[index]) return;
		window.scrollTo({
			top: inputs[index].getBoundingClientRect().top + window.scrollY - 20,
			behavior: 'smooth'
		});
	}

	function addNewQuestion(input: QuestionClient, index: number) {
		const data = [...$testObject.questions];
		data.splice(index, 0, input);
		$testObject.questions = data;
	}

	function removeQuestion(index: number) {
		$testObject.questions = $testObject.questions.filter((_, i) => i !== index);
		delete activators[index + 1];
	}

	function onNewInputClick(input: QuestionTemplate) {
		const newQuestionData = createNewInput(input);

		newInputClose();
		addNewQuestion(
			newQuestionData as QuestionClient,
			$testObject.questions.length
		);
		isDropdownOpen = false;
	}

	function onOrderChange(e: {
		detail: { items: QuestionClient[]; info: { source: any } };
	}) {
		$testObject.questions = e.detail.items;
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisable = true;
		}
	}

	function onOrderConsideration(e: { detail: { items: QuestionClient[] } }) {
		$testObject.questions = e.detail.items;
	}

	function startDrag(e: Event) {
		e.preventDefault();
		dragDisable = false;
	}

	type Activators = {
		[index: number]: HTMLElement;
	};

	let activators: Activators = {};

	let displayedActivatorId: number = -1;

	let containerRef: HTMLDivElement;

	// Calculates which activator should be displayed
	function calculateActivatorToDisplay(event: MouseEvent) {
		for (let i in activators) {
			if (activators[i] === null) continue;
			if (displayedActivatorId === -1) {
				displayedActivatorId = +i;
				return;
			}
			const activatorRect = activators[i].getBoundingClientRect();
			const origRect = activators[displayedActivatorId].getBoundingClientRect();

			// TODO: May be changed in the future
			if (
				Math.abs(activatorRect.y - event.clientY) <
				Math.abs(origRect.y - event.clientY)
			) {
				displayedActivatorId = +i;
			}
		}
	}

	function onInputDrop(event: { detail: { input: QuestionTemplate } }) {
		if ($testObject.questions.length >= QUESTION_LIMIT) {
			toast.error(
				`Sorry but you reached maximum question limit of ${QUESTION_LIMIT}!`
			);
			displayedActivatorId = -1;
		}
		if (displayedActivatorId !== -1) {
			const input = createNewInput(event.detail.input);
			if (input) {
				addNewQuestion(input, displayedActivatorId);
			}
			displayedActivatorId = -1;
		}
	}
	function getIcon(index: string) {
		if (Object.keys(questionMethods).includes(index)) {
			return questionMethods[index as keyof typeof questionMethods].icon;
		}
	}
</script>

<div
	class="relative bg-light_white dark:bg-dark_black roudned-md text-light_text_black dark:text-dark_text_white"
>
	<div class="grid__container" class:empty={$testObject.questions.length === 0}>
		<!-- <div
			style={`position: ${
				$testObject.questions.length > 0 &&
				(isInputSidebarOpen === true || windowWidth >= XL)
					? 'relative'
					: 'static'
			};`}
		> -->
		{#if $testObject.questions.length > 0 && (isInputSidebarOpen === true || windowWidth >= XL)}
			<div
				in:fly={{ x: -300 }}
				out:fly={{
					x: -300,
					duration:
						windowWidth <= XL || $testObject.questions.length === 0
							? 0
							: undefined
				}}
				class="h-full max-w-[340px]"
			>
				<CreatorInputSidebar
					inputs={inputTemplates}
					class="self-start"
					on:drop={onInputDrop}
				/>
			</div>
		{:else if $testObject.questions.length > 0 && !(isInputSidebarOpen === true || windowWidth >= XL)}
			<div class="sticky top-0 z-10 flex justify-center w-full">
				<div class="w-full h-12 max-w-[600px]">
					<button
						type="button"
						on:click={() => newInputOpen()}
						class="grid w-full h-full p-2 duration-150 rounded-md shadow-md shadow-light_text_black_40 bg-light_grey dark:bg-dark_light_grey place-content-center hover:bg-light_grey_dark dark:hover:bg-dark_terciary"
					>
						<iconify-icon icon="tabler:dots" class="text-3xl" />
					</button>
				</div>
			</div>
		{:else}
			<div />
		{/if}
		<!-- </div> -->
		<div>
			<!-- The dropdown for new input -->
			<Dialog bind:open={newInputOpen} bind:close={newInputClose}>
				<form
					method="dialog"
					class="w-full max-w-[1000px] bg-light_whiter dark:bg-dark_grey"
				>
					<h3
						class="text-lg font-bold text-light_text_black dark:text-dark_text_white"
					>
						Pick new input for your test!
					</h3>
					<Space gap={20} />
					<div class="flex flex-col gap-1">
						{#each inputTemplates as input}
							{@const icon = getIcon(input.slug)}
							<button
								type="button"
								on:click={() => onNewInputClick(input)}
								class="relative w-full px-4 py-3 text-left border-solid rounded-md bg-light_white border-light_text_black_40 hover:bg-light_whiter dark:bg-dark_black dark:border-dark_text_white_40 border-[1px] dark:hover:bg-dark_quaternary duration-150"
							>
								<div class="flex items-center gap-2">
									{#if icon}
										<iconify-icon
											{icon}
											class="text-xl dark:text-dark_text_white"
										/>
									{/if}
									<span class="text-xl font-thin dark:text-dark_text_white"
										>{input.name}</span
									>
								</div>
							</button>
						{/each}
					</div>
				</form>
				<form method="dialog" class="modal-backdrop">
					<button class="cursor-default">close</button>
				</form>
			</Dialog>
			<div
				role="group"
				class="relative flex flex-col items-center gap-2 xl:items-start"
				on:dragleave|self={() => {
					displayedActivatorId = -1;
				}}
			>
				<!-- Displaying the initial create button -->
				{#if $testObject.questions.length === 0}
					<div class="flex flex-col items-center gap-3 mx-auto">
						<h4
							class="font-semibold text-body2 sm:text-body1 md:text-h6 text-light_text_black dark:text-dark_text_white"
						>
							Start with the first question!
						</h4>
						<div class="grid grid-cols-2 grid-rows-2">
							<img
								src="/imgs/svgs/piece.svg"
								width="500"
								class="max-w-[500px] min-w-[150px] w-[80%] col-start-1 row-start-1 col-span-2 row-span-2"
								alt=""
							/>
							<div class="grid col-start-2 row-start-2 place-content-center">
								<BasicButton
									onClick={() => newInputOpen()}
									title="Add question"
								/>
							</div>
						</div>
					</div>
				{:else}
					<div
						role="button"
						tabindex="0"
						class="flex flex-col w-full gap-3 lg:w-4/5 xl:w-full max-w-[600px]"
						use:dndzone={{
							items: $testObject['questions'],
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
							calculateActivatorToDisplay(e);
							if (e?.dataTransfer?.effectAllowed) {
								e.preventDefault();
								e.dataTransfer.dropEffect = 'move';
							}
						}}
						bind:this={containerRef}
					>
						<!-- Separator with add new input -->
						{#each $testObject['questions'] as question, index (question['id'])}
							<!-- Div which needs to be here for draggeble to be in creator and not in input -->
							<div bind:this={inputs[index]} animate:flip={{ duration: 300 }}>
								<!-- {#if index === 0}
							<CreatorInputDropdownActivator />
							{/if} -->

								{#if index === 0}
									<div bind:this={activators[0]}>
										<CreatorInputDropdownActivator
											isVisible={displayedActivatorId === 0}
											class="h-1"
										/>
									</div>
								{:else}
									<div class="h-1" />
								{/if}
								<div class="flex flex-col gap-3">
									<Input
										{index}
										on:questionDetails={({ detail }) => {
											$testObject.questions[index]['content'] = detail;
										}}
										on:titleChange={({ detail }) => {
											$testObject.questions[index]['title'] = detail;
										}}
										on:deleteInput={() => removeQuestion(index)}
										on:dnddrag={startDrag}
									/>
									<div bind:this={activators[index + 1]}>
										<CreatorInputDropdownActivator
											isVisible={displayedActivatorId === index + 1}
										/>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
	<!-- on:drag={(event) => (newInputDrag = event.detail.isDragging)} -->
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 340px 1fr;
		transition: grid-template-columns 0.3s ease-in-out;
	}

	@media (max-width: 1280px) {
		.grid__container {
			grid-template-columns: 1fr;
		}
	}

	/* @media (max-width: 640px) {
		.grid__container {
			grid-template-columns: 1fr;
			grid-template-rows: 40px 1fr;
		}
	} */

	.empty > *:nth-child(1) {
		grid-column-start: 1;
		grid-row-start: 1;
	}

	.empty > *:nth-child(2) {
		grid-column-start: 1;
		grid-row-start: 1;
		grid-column-end: 3;
	}

	/* .new-input-button {
		background-image: radial-gradient(
						ellipse at 50% 0,
						white 60%,
						var(--light-primary) 300%
						);
		isolation: isolate;
		transition: 0.4s ease;
		perspective: 1000px;
	}

	.new-input-button:hover {
		transform: translateY(-5px);
	}

	.new-input-button::before {
		content: '';
		inset: 10px;
		position: absolute;
		z-index: -10;
		background-color: var(--light-white);
		border-radius: inherit;
		transition: 0.3s ease;
	}

	:global(.dark) .new-input-button::before {
		background-color: var(--dark_black);
	}

	.new-input-button:hover::before {
		inset: 20px;
	} */
</style>
