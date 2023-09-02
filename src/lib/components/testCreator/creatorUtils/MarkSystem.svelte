<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { testObject } from '~stores/testObject';
	import {
		MARK_LIMIT_MAX,
		MARK_LIMIT_MIN,
		MARK_MAX,
		MARK_MIN,
		LIMIT_OPTIONS,
		markLimitSchema,
		markSchema
	} from '~schemas/textInput';
	import RemoveButton from './RemoveButton.svelte';

	export let isAdded = true;

	type Mark = {
		name: string;
		limitInPercent: number;
	};

	let marks: Mark[] = [
		{
			name: 'Failed',
			limitInPercent: 0
		},
		{
			name: 'Passed',
			limitInPercent: 50
		}
	];

	$: {
		if (isAdded === false) {
			$testObject.markSystem = {};
		} else {
			$testObject.markSystem = {
				marks: marks.map((item) => {
					return {
						name: item.name,
						limit: +item.limitInPercent
					};
				})
			};
		}
	}

	$: console.log($testObject.markSystem);
</script>

<div class="p-2 rounded-md shadow-sm bg-light_whiter dark:bg-dark_grey">
	<div class="flex items-center gap-2">
		<div class="dropdown dropdown-hover dropdown-top">
			<button
				type="button"
				tabindex="0"
				class="m-1"
				on:click={() => (isAdded = !isAdded)}>Enable marking?</button
			>
			<p
				class="dropdown-content z-[1] menu p-2 shadow bg-base-100 dark:bg-dark_grey rounded-box w-52"
			>
				Mark system enables being marked by the outcome of the test
			</p>
		</div>

		<input
			type="checkbox"
			class="checkbox checkbox-primary dark:checkbox-accent"
			bind:checked={isAdded}
		/>
	</div>
	{#if isAdded}
		<div class="flex flex-col gap-1 max-w-[400px]">
			{#each marks as mark, index}
				<!-- {@const isDisabled = !(
					index === 0 || marks[index - 1]['limitInPercent'] > 0
				)} -->
				<div class="flex gap-1">
					<div class="grid w-full grid-cols-4 gap-3">
						<TextInputSimple
							title={'Mark ' + (index + 1)}
							titleName={'Mark ' + (index + 1)}
							validationSchema={markSchema}
							bind:inputValue={mark.name}
							min={MARK_MIN}
							max={MARK_MAX}
							doesLimit
							customContainerStyles="col-span-2"
						/>
						<div class="flex items-center col-span-2 gap-1">
							<select
								class="w-full max-w-xs bg-white shadow-md select"
								bind:value={mark.limitInPercent}
							>
								{#if index === 0}
									{#each LIMIT_OPTIONS as option}
										<option value={option}>{option}%</option>
									{/each}
								{:else}
									{#each LIMIT_OPTIONS.filter((limit) => limit < marks[index - 1]?.limitInPercent) as option}
										<option value={option}>{option}%</option>
									{/each}
								{/if}
							</select>
							<!-- <TextInputSimple
								title={'Limit ' + (index + 1)}
								titleName={'Limit ' + (index + 1)}
								validationSchema={markLimitSchema}
								bind:inputValue={mark.limitInPercent}
								min={MARK_LIMIT_MIN}
								max={index === 0
									? MARK_LIMIT_MAX
									: marks[index - 1].limitInPercent - 1}
								doesLimit
								trailing="%"
								customContainerStyles="col-span-2"
								inputProperties={{
									type: 'number',
									disabled: isDisabled,
									min: MARK_LIMIT_MIN,
									max:
										index === 0
											? MARK_LIMIT_MAX
											: marks[index - 1].limitInPercent - 1
								}}
								on:inputChange={(e) => {
									// console.log(e.detail);
								}}
							/> -->
						</div>
					</div>
					<RemoveButton
						deleteQuestion={() =>
							(marks = marks.filter((_, idx) => idx !== index))}
						questionLength={marks.length}
						questionLimit={2}
						class="w-12 my-2 rounded-md aspect-square"
					/>
				</div>
			{/each}
			<button
				type="button"
				on:click={() => {
					marks = [...marks, { name: '', limitInPercent: 0 }];
				}}
				class="py-2 mt-2 font-semibold uppercase duration-100 rounded-md bg-light_secondary dark:bg-dark_secondary hover:bg-light_terciary dark:hover:bg-dark_terciary"
				>Add</button
			>
		</div>
	{/if}
</div>

<style>
</style>
