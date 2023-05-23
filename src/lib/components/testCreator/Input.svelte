<!-- IMPORTANT: This is Input for Creator, both of them are for creating tests only, not for taking them -->
<!-- Input will trigger an event called questionDetails, which will contain the details of the question, which
will be used in the test creator -->

<script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import type { QuestionTemplate } from '~/lib/trpc/router';
	import PickOneInput from '~components/testCreator/creatorInputs/PickOne.svelte';
	import TrueFalseInput from '~components/testCreator/creatorInputs/TrueFalse.svelte';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let inputType: Question['questionType'];
	export let displayType: QuestionTemplate['name'];

	let title: string;

	function titleValueEvent() {
		dispatch('titleDetails', title);
	}

	$: titleValueEvent(), title;
</script>

<div class="w-full p-4 rounded-lg shadow-lg shadow-light_text_black_20 bg-light_whiter">
	<div class="flex justify-between">
		<p class="text-light_text_black_40 text-body2">{displayType}</p>
		<button
			on:click={() => {
				dispatch('deleteInput');
			}}
		>
			<Icon
				icon="material-symbols:close-rounded"
				class="text-3xl duration-200 group-hover:rotate-90"
			/>
		</button>
	</div>
	<Space gap={20} />
	<h6 class="text-light_text_black">
		<TextInput title="Title" titleName="title" bind:inputValue={title} />
	</h6>
	<Space gap={10} />
	<Separator color={'var(--light-text-black-20)'} w="100%" h="0.5px" />
	<Space gap={10} />
	<div class="p-2 content">
		{#if inputType === 'pickOne'}
			<PickOneInput on:questionDetails />
		{:else if inputType === 'true/false'}
			<TrueFalseInput on:questionDetails />
		{/if}
	</div>
</div>

<!-- <script lang="ts">
	import Separator from '~components/separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';

	export let title: string;
	export let content: QuestionContent;

	// This is optional reference to form element wrapping the inputs, usefull if radio buttons or other inputs are used
	let formRef: HTMLFormElement | null = null;

	function displayTypeValue(content: QuestionContent) {
		switch (content.inputType) {
			case 'true/false':
				return 'True / False';
			case 'pickOne':
				return 'Pick one';
		}
	}

	// export function checkResult() {
	// 	console.log('JESTLI TO JDE TAK JE TO SUPER');
	// 	switch (content.inputType) {
	// 		case 'true/false':
	// 			return content.questions[0].answer;
	// 		case 'pickOne':
	// 			if (!formElement) return false;
	// 			const inputs = formElement.querySelectorAll('input');
	// 			console.log(inputs);
	// 	}
	// }
</script>

<div class="w-full p-4 rounded-lg bg-light_whiter">
	<p class="text-light_text_black_40 text-body2">{displayTypeValue(content)}</p>
	<Space gap={20} />
	<h6 class="text-light_text_black">{title}</h6>
	<Separator color={'var(--light-text-black-20)'} w="100%" h="0.5px" />
	<div class="p-2 content">
		{#if content.inputType === 'pickOne'}
			<form bind:this={formRef}>
				{#each content.questions as { question }, i}
					<div class="flex">
						<label for="{question}{i}">{question}</label>
						<input type="radio" id="{question}{i}" name={title} />
					</div>
				{/each}
			</form>
		{/if}
	</div>
</div> -->
