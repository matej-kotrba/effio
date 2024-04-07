<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { trpc } from '~/lib/trpc/client';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import Limit from '~components/informatic/Limit.svelte';
	import Invalidating from '~components/portals/Invalidating.svelte';
	import * as Popover from '~components/ui/popover/index';

	let classes = '';
	export { classes as class };
	export let limit:
		| {
				min: number;
				max: number;
		  }
		| undefined = undefined;

	// Works for getting all tests as well as for getting tests already added to the subcategory
	type Test = {
		testId: string;
		title: string;
		subcategoryOnTestId?: number;
		isAdded?: boolean;
	};

	export let tests: Test[] = [];
	export let groupId: string;
	export let subcategoryId: string;

	$: testsToEdit = tests;

	let closeSubcategoryPopover: () => void;
	let isSavingSubcategories = false;

	const dispatch = createEventDispatcher();

	export let textAreaRef: HTMLTextAreaElement;

	function onInput() {
		textAreaRef.style.height = 'auto';
		textAreaRef.style.height = `${textAreaRef.scrollHeight}px`;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && e.shiftKey === false && e.ctrlKey === false) {
			e.preventDefault();
			submitContent();
			onInput();
		}
	}

	function submitContent() {
		dispatch('chatSubmit', textAreaRef.value);
	}

	async function onSubcategoryOnTestsSave() {
		isSavingSubcategories = true;
		try {
			const testsToAdd = testsToEdit
				.filter((test) => test.isAdded && !test.subcategoryOnTestId)
				.map((test) => {
					return { id: test.testId, title: test.title };
				});
			const testsToDelete = testsToEdit
				.filter((test) => !test.isAdded && test.subcategoryOnTestId)
				.map((test) => {
					return {
						id: test.subcategoryOnTestId as number,
						testTitle: test.title,
						subcategoryId: subcategoryId
					};
				});

			console.log(testsToAdd, testsToDelete);

			await trpc().protected.updateSubcategoryConnectionsToTest.mutate({
				groupId: groupId,
				subcategoryId: subcategoryId,
				connectionsToDelete: testsToDelete,
				testsToConnect: testsToAdd
			});
		} catch (error) {
		} finally {
			isSavingSubcategories = false;
			closeSubcategoryPopover();
		}
	}

	function onSubcategoryOnTestsClose() {
		closeSubcategoryPopover();
		testsToEdit = tests;
	}

	onMount(() => {
		textAreaRef.style.height = `${textAreaRef.scrollHeight}px`;
	});
</script>

<Invalidating invalidating={isSavingSubcategories} />
<div
	class={twMerge(
		'group fixed w-full max-w-full shadow z-10 flex items-start bg-white dark:bg-dark_light_grey duration-100 outline-2 outline outline-transparent rounded-l-md rounded-br-md rounded-tr-none',
		classes
	)}
>
	{#if limit && textAreaRef}
		<div
			class="absolute px-2 py-1 w-16 grid place-content-center bg-white dark:bg-dark_light_grey
			 right-0 bottom-[calc(100%+2px)] outline-transparent duration-100 rounded-t-md input__out_box"
		>
			<Limit
				min={limit.min}
				max={limit.max}
				current={textAreaRef.value.length}
			/>
		</div>
	{/if}
	<textarea
		bind:this={textAreaRef}
		rows="1"
		minlength={limit?.min}
		maxlength={limit?.max}
		class="w-full dark:bg-dark_light_grey px-2 py-2 duration-150 rounded-l-md resize-none max-h-[380px] outline-none text-body1"
		on:input={onInput}
		on:keydown={onKeyDown}
	/>
	<Popover.Root bind:closeFocus={closeSubcategoryPopover}>
		<Popover.Trigger>
			<button
				type="button"
				on:click={(e) => {
					e.preventDefault();
				}}
				class="grid h-[43px] bg-white dark:bg-dark_light_grey place-content-center group/container"
			>
				<iconify-icon
					icon="fluent:form-new-20-filled"
					class="text-3xl duration-100 text-light_text_black group-hover/container:text-light_primary dark:text-dark_text_white dark:group-hover/container:text-dark_primary"
				/>
			</button>
		</Popover.Trigger>
		<Popover.Content>
			{#if testsToEdit.length === 0}
				<p>Sorry, no tests available to connect.</p>
			{:else}
				{#each testsToEdit as test}
					<div class="flex justify-between gap-4 max-h-[350px] overflow-y-auto">
						<label
							for={test.testId}
							class="overflow-hidden whitespace-nowrap text-ellipsis"
							>{test.title}</label
						>
						<input
							class="checkbox checkbox-primary dark:checkbox-accent"
							name={test.testId}
							type="checkbox"
							bind:checked={test.isAdded}
						/>
					</div>
				{/each}
			{/if}
			<div class="flex justify-end gap-2 mt-2">
				<SimpleButton variant="ghost" onClick={onSubcategoryOnTestsClose}
					>Cancel</SimpleButton
				>
				<SimpleButton
					variant="filled"
					designType="primary"
					type="submit"
					onClick={onSubcategoryOnTestsSave}
					disabled={isSavingSubcategories}>Save</SimpleButton
				>
			</div>
		</Popover.Content>
	</Popover.Root>
	<button
		type="button"
		on:click={submitContent}
		class="grid h-[43px] bg-white dark:bg-dark_light_grey place-content-center rounded-r-md px-2 group/container"
	>
		<iconify-icon
			icon="mingcute:send-plane-fill"
			class="text-3xl duration-100 text-light_text_black group-hover/container:text-light_primary dark:text-dark_text_white dark:group-hover/container:text-dark_primary"
		/>
	</button>
</div>

<style>
	.input__out_box::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 2px;
		top: 100%;
		left: 0;
		background-color: white;
	}

	:global(.dark) .input__out_box::before {
		background-color: var(--dark-light_grey);
	}
</style>
