<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clickOutside } from '~use/clickOutside';
	import Input from '~components/testCreator/Input.svelte';
	import type { QuestionTemplate } from '~/lib/trpc/router';

	type InputToShowObject = {
		inputType: QuestionContent['inputType'];
		displayType: string;
	};

	// Variable which stores all the inputs and display them in the dropdown (usually fetch this from the database)
	export let inputTemplates: QuestionTemplate[] = [];

	let openDropdown = false;

	// Array containing the name of inputs used in the test creator to display them ❗
	let inputsToShow: InputToShowObject[] = [];

	// Stores the data of questions created, from this then will be created JSON which will be sent to the DB ❗
	let questionsData: (
		| Question
		| {
				[key: string]: never;
		  }
	)[] = [];

	function addNewQuestion(input: InputToShowObject) {
		questionsData = [...questionsData, {}];
		inputsToShow = [...inputsToShow, input];
	}

	function removeQuestion(index: number) {
		questionsData = questionsData.filter((_, i) => i !== index);
		inputsToShow = inputsToShow.filter((_, i) => i !== index);
	}

	function onDropdownInputClick(input: QuestionTemplate) {
		addNewQuestion({
			inputType: input.properties.inputType as QuestionContent['inputType'],
			displayType: input.name
		});
		openDropdown = false;
	}
</script>

<div class="p-4 bg-light_white roudned-md text-light_text_black">
	<div class="relative flex flex-col items-center justify-center gap-2">
		<div class="flex flex-row items-center w-full gap-4 px-4">
			<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
			<button
				type="button"
				class="relative z-10 p-2 duration-200 rounded-lg bg-light_secondary text-whiter hover:bg-primary"
				on:click={() => (openDropdown = !openDropdown)}
			>
				<Icon icon="ic:round-plus" class="text-5xl rounded-lg text-light_white" />
			</button>
			<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
			<div
				use:clickOutside
				on:clickoutside={() => (openDropdown = false)}
				class="absolute right-0 w-full grid_layout gap-4 p-4 absoluteContainer z-30
				rounded-md shadow-lg bottom-[calc(100%+10px)] bg-light_whiter duration-200
				{openDropdown ? '' : 'opacity-0 pointer-events-none'}"
			>
				{#each inputTemplates as input}
					<button
						type="button"
						on:click={() => onDropdownInputClick(input)}
						class="grid w-full rounded-md aspect-square text-light_whiter bg-light_primary place-content-center"
					>
						{input.name}
					</button>
				{/each}
			</div>
		</div>
		<div class="flex flex-col w-full gap-3 lg:w-3/4 xl:w-2/3">
			{#each inputsToShow as { displayType, inputType }, index}
				<Input
					{inputType}
					{displayType}
					on:questionDetails={({ detail }) => {
						questionsData[index]['content'] = detail;
					}}
					on:titleDetails={({ detail }) => {
						questionsData[index]['title'] = detail;
					}}
				/>
			{/each}
			<!-- <Input
				inputType="pickOne"
				displayType="Pick One"
				on:questionDetails={({ detail }) => {
					testInputs[0]['content'] = detail;
				}}
				on:titleDetails={({ detail }) => {
					testInputs[0]['title'] = detail;
				}}
			/>
			<Input
				inputType="true/false"
				displayType="True / False"
				on:questionDetails={({ detail }) => {
					testInputs[1]['content'] = detail;
				}}
				on:titleDetails={({ detail }) => {
					testInputs[1]['title'] = detail;
				}}
			/> -->
		</div>
	</div>
</div>

<style>
	.grid_layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		overflow-y: scroll;
		max-height: 250px;
	}

	/* width */
	.absoluteContainer::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	.absoluteContainer::-webkit-scrollbar-track {
		background: var(--light-text-black-20);
		border-radius: 50px;
	}

	/* Handle */
	.absoluteContainer::-webkit-scrollbar-thumb {
		background: var(--light-terciary);
		border-radius: 50px;
	}

	/* Handle on hover */
	.absoluteContainer::-webkit-scrollbar-thumb:hover {
		background: var(--light-secondary);
	}
</style>
