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
	import Fill from './creatorInputs/Fill.svelte';
	import { clickOutside } from '~use/clickOutside';
	import Geography from './creatorInputs/Geography.svelte';

	let dispatch = createEventDispatcher();

	export let index: number;

	function dispatchDragEvent() {
		dispatch('dnddrag');
	}

	let isCollapsed = false;

	let dropdownRef: HTMLDetailsElement;

	const MIN_RANGE_VALUE: number = 0;
	const MAX_RANGE_VALUE: number = 10;

	function onButtonClick(value: number) {
		if ($testObject.questions[index].points + value < MIN_RANGE_VALUE) return;
		if ($testObject.questions[index].points + value > MAX_RANGE_VALUE) return;
		$testObject.questions[index].points += value;
	}

	$: {
		if (
			$testObject.questions[index].points &&
			$testObject.questions[index].points === undefined
		) {
			$testObject.questions[index].points = 2;
		}
	}
</script>

<div
	class="w-full p-4 rounded-lg shadow-lg shadow-light_text_black_20 bg-light_whiter dark:bg-dark_grey"
>
	<div class="grid grid-cols-3">
		<p
			class="justify-self-start text-light_text_black dark:text-dark_text_white_40 text-body2"
		>
			{$testObject['questions'][index].displayType}
		</p>
		<div
			class="justify-self-center hover:cursor-grab"
			aria-label="drag-handle"
			on:mousedown={dispatchDragEvent}
			on:touchstart={dispatchDragEvent}
		>
			<iconify-icon
				icon="akar-icons:drag-horizontal"
				class="text-3xl text-light_text_black dark:text-dark_text_white_80"
			/>
		</div>
		<div class="flex items-center gap-3 justify-self-end">
			<button
				type="button"
				class={`grid place-content-center transform-transition ${
					isCollapsed ? 'rotate-180' : ''
				}`}
				on:click={() => {
					isCollapsed = !isCollapsed;
				}}
			>
				<iconify-icon icon="iconamoon:arrow-down-2-duotone" class="text-3xl" />
			</button>
			<button
				type="button"
				on:click={() => {
					dispatch('deleteInput');
				}}
				class=" group"
			>
				<iconify-icon
					icon="material-symbols:close-rounded"
					class="text-3xl group-hover:rotate-90 text-light_text_black group-hover:text-error dark:text-dark_error"
					style="transition: 200ms transform;"
				/>
			</button>
		</div>
	</div>
	<Space gap={20} />
	<h6 class="text-light_text_black dark:text-dark_text_white">
		<TextInput
			title="Title"
			titleName="title"
			bind:inputValue={$testObject.questions[index].title}
			validationSchema={titleSchema}
			on:error={(data) => {
				$testObject.questions[index]['errors']['title'] = data.detail;
			}}
		/>
	</h6>
	<p
		class={`text-error dark:text-dark_error text-body2 ${
			$testObject.questions[index].errors.title ? '' : 'opacity-0'
		}`}
	>
		{$testObject.questions[index].errors.title || 'Placeholder error'}
	</p>
	<Space gap={10} />
	<div class:collapsed={isCollapsed} class="collapsible">
		<div>
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
				{:else if $testObject['questions'][index]['questionType'] === 'fill'}
					<Fill on:questionDetails indexParent={index} />
				{:else if $testObject['questions'][index]['questionType'] === 'geography'}
					<Geography on:questionDetails indexParent={index} />
				{/if}
			</div>
			<div class="flex items-center justify-between">
				<details
					class="dropdown dropdown-top"
					use:clickOutside
					bind:this={dropdownRef}
					on:clickoutside={() => {
						dropdownRef.removeAttribute('open');
					}}
				>
					<summary
						class="m-1 shadow-md btn dark:bg-dark_terciary dark:border-dark_terciary dark:text-dark_text_white dark:hover:bg-dark_quaternary dark:hover:border-dark_quaternary"
						>Edit points</summary
					>
					<div
						class="p-3 shadow-md menu dropdown-content z-[1] bg-light_grey dark:bg-dark_terciary rounded-box w-52"
					>
						<h6 class="font-semibold text-center">Points for this question?</h6>
						<p class="text-2xl font-semibold text-center">
							{$testObject.questions[index].points}
						</p>
						<div class="flex items-center gap-1">
							<button
								class="grid w-10 font-bold duration-100 rounded-md place-content-center aspect-square dark:bg-dark_quaternary dark:hover:bg-dark_secondary"
								on:click={() => onButtonClick(-1)}>-1</button
							>
							<input
								bind:value={$testObject.questions[index].points}
								type="range"
								min={MIN_RANGE_VALUE}
								max={MAX_RANGE_VALUE}
								class="range range-xs dark:bg-dark_text_white_20"
							/>
							<button
								class="grid w-10 font-bold duration-100 rounded-md place-content-center aspect-square dark:bg-dark_quaternary dark:hover:bg-dark_secondary"
								on:click={() => onButtonClick(1)}>+1</button
							>
						</div>
					</div>
				</details>
				<span
					class={`max-w-[50%] inline-block text-error dark:text-dark_error text-body2 ${
						$testObject.questions[index].errors.global ? '' : 'opacity-0'
					}`}>{$testObject.questions[index].errors.global}</span
				>
			</div>
		</div>
	</div>
</div>

<style>
	.transform-transition {
		transition: transform 150ms;
	}

	.collapsible {
		display: grid;
		grid-template-rows: 1fr;
		/* transition: 200ms grid-template-rows ease; */
	}

	/* .collapsible > div {
		overflow: hidden;
	} */
	.collapsed > div {
		overflow: hidden;
	}

	.collapsed {
		grid-template-rows: 0fr;
		overflow: hidden;
	}
</style>
