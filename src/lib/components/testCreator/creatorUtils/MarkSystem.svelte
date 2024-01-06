<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { testObject } from '~stores/testObject';
	import {
		MARK_MAX,
		MARK_MIN,
		LIMIT_OPTIONS,
		markSchema,
		MARK_LIMIT_MAX_MARK_COUNT
	} from '~schemas/textInput';
	import RemoveButton from './RemoveButton.svelte';

	export let isAdded = true;
	export let defaultValue: MarkSystemJSON['marks'] = [
		{
			name: 'Passed',
			limit: 50
		},

		{
			name: 'Failed',
			limit: 0
		}
	];

	type Mark = {
		name: string;
		limitInPercent: number | undefined;
	};

	let marks: Mark[] = defaultValue.map((item) => {
		return {
			name: item.name,
			limitInPercent: item.limit
		};
	});

	$: {
		if (isAdded === false) {
			$testObject.markSystem = {};
		} else {
			$testObject.markSystem = {
				marks: marks.map((item) => {
					return {
						name: item.name,
						limit: item.limitInPercent
					};
				})
			};
		}
	}

	function onSelect(index: number, value: number) {
		for (let i = index + 1; i < marks.length - 1; i++) {
			if (marks[i]?.limitInPercent === undefined) continue;

			// @ts-ignore
			if (marks[i].limitInPercent >= value) {
				marks[i].limitInPercent = undefined;
			}
		}
	}
</script>

<div class="p-2 rounded-md shadow-sm bg-light_whiter dark:bg-dark_grey">
	<div class="flex items-center gap-2">
		<div class="z-10 dropdown dropdown-hover dropdown-top">
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
		<p class="text-sm">
			* Mark with limit 0% is the fallback mark which will be applied when user
			has 0 and more points.
		</p>
		<div class="flex flex-col gap-1 max-w-[500px]">
			{#each marks as mark, index}
				<div class="flex gap-1">
					<div class="grid w-full grid-cols-5 gap-1">
						<div class="flex flex-col w-full col-span-2">
							<TextInputSimple
								title={'Mark ' + (index + 1)}
								titleName={'Mark ' + (index + 1)}
								validationSchema={markSchema}
								bind:inputValue={mark.name}
								min={MARK_MIN}
								max={MARK_MAX}
								doesLimit
								on:error={(e) => {
									if (!$testObject.errors.markSystem)
										$testObject.errors.markSystem = {
											marks: []
										};

									if (!$testObject.errors.markSystem.marks[index]) {
										$testObject.errors.markSystem.marks[index] = {};
									}

									$testObject.errors.markSystem.marks[index].name = e.detail;
								}}
							/>
						</div>
						<div class="flex flex-col w-full col-span-3">
							<div class="flex items-center h-full gap-1">
								<select
									class="w-full max-w-xs bg-white shadow-md dark:bg-dark_light_grey select"
									bind:value={mark.limitInPercent}
									disabled={index === marks.length - 1}
									on:change={(e) => {
										onSelect(index, +e.currentTarget.value);
									}}
								>
									{#if index === 0}
										{#each LIMIT_OPTIONS as option}
											<option value={option}>{option}%</option>
										{/each}
									{:else if index === marks.length - 1}
										<option value={0}>{0}%</option>
									{:else if marks[index - 1].limitInPercent !== undefined}
										{@const item = marks[index - 1].limitInPercent}
										{#each [undefined, ...LIMIT_OPTIONS.filter((limit) => {
												return limit !== undefined && item !== undefined && limit < item;
											})] as option}
											<option value={option} disabled={option === undefined}
												>{option ? option : ''}{option
													? '%'
													: 'Please select a value'}</option
											>
										{/each}
									{:else}
										<option disabled value={undefined}
											>Please fill previous limit</option
										>
									{/if}
								</select>
							</div>
						</div>
						<div class="grid grid-cols-5 col-span-5 mx-2">
							<div class="col-span-2">
								{#if $testObject.errors.markSystem?.marks[index]?.name}
									<p class="text-xs text-error dark:text-dark_error">
										{$testObject.errors.markSystem?.marks[index]?.name}
									</p>
								{/if}
							</div>
							<div class="col-span-3">
								{#if $testObject.errors.markSystem?.marks[index]?.limit}
									<p class="text-xs text-error dark:text-dark_error">
										{$testObject.errors.markSystem?.marks[index]?.limit}
									</p>
								{/if}
							</div>
						</div>
					</div>
					{#if index !== marks.length - 1}
						<RemoveButton
							deleteQuestion={() =>
								(marks = marks.filter((_, idx) => idx !== index))}
							questionLength={marks.length}
							questionLimit={2}
							tooltipText="Delete mark"
							class="w-12 my-2 ml-1 rounded-md max-h-16 aspect-square"
						/>
					{/if}
				</div>
			{/each}
			<button
				type="button"
				on:click={() => {
					if (marks.length < MARK_LIMIT_MAX_MARK_COUNT) {
						marks.splice(marks.length - 1, 0, {
							name: '',
							limitInPercent: undefined
						});
						marks = marks;
					}
				}}
				disabled={marks.length >= MARK_LIMIT_MAX_MARK_COUNT}
				class="py-2 mt-2 font-semibold text-white uppercase duration-100 rounded-md disabled:bg-gray-500 dark:disabled:bg-gray-700 bg-light_secondary dark:bg-dark_secondary hover:bg-light_terciary dark:hover:bg-dark_terciary"
				>Add</button
			>
		</div>
		{#if $testObject.errors?.markSystem?.message}
			<div>
				<p class="text-sm text-error dark:text-dark_error">
					{$testObject.errors.markSystem.message}
				</p>
			</div>
		{/if}
	{/if}
</div>

<style>
</style>
