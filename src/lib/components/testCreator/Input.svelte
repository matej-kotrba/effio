<!-- IMPORTANT: This is Input for Creator, both of them are for creating tests only, not for taking them -->
<!-- Input will trigger an event called questionDetails, which will contain the details of the question, which
will be used in the test creator -->

<script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Space from '~components/separators/Space.svelte';
	import TextInput from '~components/inputs/TextInput.svelte';
	import PickOneInput from '~components/testCreator/creatorInputs/PickOne.svelte';
	import TrueFalseInput from '~components/testCreator/creatorInputs/TrueFalse.svelte';
	import { createEventDispatcher } from 'svelte';
	import { testObject } from '~stores/testObject';
	import { titleSchema } from '~schemas/textInput';
	import Connect from './creatorInputs/Connect.svelte';
	import Write from './creatorInputs/Write.svelte';

	let dispatch = createEventDispatcher();

	export let index: number;

	let titleError: string | null;

	function dispatchDragEvent() {
		dispatch('dnddrag');
	}
</script>

<div
	class="w-full p-4 rounded-lg shadow-lg shadow-light_text_black_20 bg-light_whiter"
>
	<div class="grid grid-cols-3">
		<p class="justify-self-start text-light_text_black_40 text-body2">
			{$testObject['questions'][index].displayType}
		</p>
		<div
			class="justify-self-center hover:cursor-grab"
			aria-label="drag-handle"
			on:mousedown={dispatchDragEvent}
			on:touchstart={dispatchDragEvent}
		>
			<Icon
				icon="akar-icons:drag-horizontal"
				class="text-3xl text-light_text_black_80"
			/>
		</div>
		<button
			on:click={() => {
				dispatch('deleteInput');
			}}
			class="justify-self-end group"
		>
			<Icon
				icon="material-symbols:close-rounded"
				class="text-3xl group-hover:rotate-90 text-light_text_black group-hover:text-error"
				style="transition: 200ms transform;"
			/>
		</button>
	</div>
	<Space gap={20} />
	<h6 class="text-light_text_black">
		<TextInput
			title="Title"
			titleName="title"
			bind:inputValue={$testObject.questions[index].title}
			validationSchema={titleSchema}
			on:error={(data) => (titleError = data.detail)}
		/>
	</h6>
	{#if titleError || $testObject.questions[index].errors.title}
		<p class="text-error text-body2">
			{titleError || $testObject.questions[index].errors.title}
		</p>
	{/if}
	<Space gap={10} />
	<Separator color={'var(--light-text-black-20)'} w="100%" h="0.5px" />
	<Space gap={10} />
	<div class="p-2 content">
		{#if $testObject['questions'][index]['questionType'] === 'pickOne'}
			<PickOneInput on:questionDetails indexParent={index} />
		{:else if $testObject['questions'][index]['questionType'] === 'true/false'}
			<TrueFalseInput on:questionDetails indexParent={index} />
		{:else if $testObject['questions'][index]['questionType'] === 'connect'}
			<Connect on:questionDetails indexParent={index} />
		{:else if $testObject['questions'][index]['questionType'] === 'write'}
			<Write on:questionDetails indexParent={index} />
		{/if}
	</div>
</div>
