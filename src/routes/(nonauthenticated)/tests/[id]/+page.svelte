<script lang="ts">
	import Input from '~components/testTaking/Input.svelte';
	import { testObject } from '~stores/testObject';
	import {
		checkTestClient,
		checkTestServerAndRecordIt,
		initializeTestToTestStore
	} from '~helpers/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import { fade } from 'svelte/transition';
	import type { TestVersion } from '@prisma/client';
	import Collapsible from '~components/collapsibles/Collapsible.svelte';
	import MarkSystem from '~components/testCreator/creatorUtils/MarkSystem.svelte';
	import { MARK_LIMIT_MAX, MARK_MAX } from '~schemas/textInput.js';
	import Separator from '~components/separators/Separator.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import { goto } from '$app/navigation';

	export let data;

	let isTakingTest = false;

	let openDialog: () => void;

	// console.log(data.testContent);

	initializeTestToTestStore(data.testContent);

	// TODO: Create a check for the JSON so we make sure that the JSON is in correct format
	let markSystem: MarkSystemJSON['marks'] | null;
	if (data.testContent.testVersions[0].markSystemJSON) {
		markSystem = JSON.parse(
			data.testContent.testVersions[0].markSystemJSON?.toString()
		) as MarkSystemJSON['marks'];
	} else {
		markSystem = null;
	}

	function startTest() {
		isTakingTest = true;
		goto(`/tests/${data.testContent.id}/take`);
	}
</script>

<div class="max-w-[1200px] mx-auto p-3 rounded-md">
	<h3 class="text-h3 font-extralight">Test overview</h3>
	<div class="p-2">
		<p class="mb-3">
			<span
				class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
				>Test name:</span
			><br />{data.testContent.title}
		</p>
		<p class="mb-3">
			<span
				class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
				>Test description:</span
			><br />{data.testContent.description}
		</p>
		<div class="flex items-center gap-2 mb-3">
			<span
				class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
				>Author:</span
			>
			<div class="dropdown dropdown-hover dropdown-top">
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label tabindex="0">
					<img
						src={data.testContent.owner.image}
						class="w-12 rounded-full"
						alt="Author"
					/>
				</label>
				<div
					class="dropdown-content z-[1] menu p-2 bg-base-100 dark:bg-dark_light_grey rounded-box w-52 shadow-md"
				>
					<p class="text-light_text_black dark:text-dark_text_white">
						{data.testContent.owner.name}
					</p>
				</div>
			</div>
		</div>
	</div>
	<p class="flex items-center gap-1">
		{#if markSystem}
			<Collapsible position="left" title="Show marking">
				<div class="grid__layout">
					<p
						class="font-semibold text-center text-light_text_black_60 dark:text-dark_text_white_60"
					>
						Grade
					</p>
					<Separator
						w="100%"
						h="100%"
						class="mb-6"
						color={$applicationStates.darkMode
							? 'var(--dark-text-white-20)'
							: 'var(--light-text-black-20)'}
					/>
					<p
						class="font-semibold text-center text-light_text_black_60 dark:text-dark_text_white_60"
					>
						Range
					</p>
					<div class="col-span-3 mb-3" />
					{#each markSystem as mark, index}
						{#if mark['name'] !== undefined && mark['limit'] !== undefined}
							{#if index === 0}
								<p class="text-center">
									{mark['name']}
								</p>
								<div />
								<p class="text-center">
									{MARK_LIMIT_MAX}% - {mark['limit']}%
								</p>
							{/if}
							{#if markSystem[index - 1]?.limit !== undefined}
								<p class="text-center">
									{mark['name']}
								</p>
								<div />
								<p class="text-center">
									{markSystem[index - 1]['limit'] || 1 - 1}% - {mark['limit']}%
								</p>
							{/if}
						{/if}
					{/each}
				</div>
			</Collapsible>
		{:else}
			<iconify-icon icon="ic:round-close" class="text-3xl text-red-600" />
		{/if}
	</p>
	<Space gap={30} />
	<BasicButton title="Take test" onClick={startTest} />
</div>

<style>
	.grid__layout {
		display: grid;
		grid-template-columns: 1fr 2px 1fr;
	}
</style>
