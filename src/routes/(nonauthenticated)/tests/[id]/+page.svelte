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

	export let data;

	let submitError: string = '';

	let result: QuestionServerCheckResponse<QuestionContent>[] | null = null;

	result = null;

	initializeTestToTestStore(data.testContent);
</script>

{#if $testObject}
	<div class="mx-auto max-w-[650px]">
		<h2 class="font-thin text-h3">{data.testContent.testVersions[0].title}</h2>
		<p class="text-light_text_black_60">
			{data.testContent.testVersions[0].description}
		</p>
		<Space gap={40} />
		{#each data.testContent.questions as _, index}
			<Input
				questionIndex={index}
				class={`border-2 border-solid ${
					$testObject.questions[index].errors.content
						? ' border-error'
						: 'border-transparent'
				}`}
				resultFormat={result === null ? null : result[index]}
			/>
			<Space gap={10} />
			{#if $testObject.questions[index].errors.content}
				<p class="text-error text-body2">
					{$testObject.questions[index].errors.content}
				</p>
			{/if}
		{/each}
		<Space gap={40} />
		<div class="flex items-center justify-between">
			{#if submitError}
				<p class="text-error text-body2">{submitError}</p>
			{/if}
			{#if result === null}
				<BasicButton
					title={'Check'}
					onClick={async () => {
						// Reset errors
						for (let i in $testObject.questions) {
							$testObject.questions[i].errors.content = '';
						}

						// Check test on the client first for all inputs filled and so on...
						let clientCheck = checkTestClient($testObject);
						if (!clientCheck['success']) {
							$testObject = clientCheck['store'];
							return;
						}

						// Then check the test on the server for the correct answers
						let res = await checkTestServerAndRecordIt($testObject);
						if (!res['success']) {
							submitError = res['error'] || 'Something went wrong';
						} else {
							submitError = '';
							console.log(res);
							if (!res['questionData']) return;
							result = res['questionData'];
							// ...
						}
					}}
					class="ml-auto"
				/>
			{/if}
		</div>
	</div>
{/if}
