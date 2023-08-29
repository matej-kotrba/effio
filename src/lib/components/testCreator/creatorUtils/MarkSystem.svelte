<script lang="ts">
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import {
		MARK_LIMIT_MAX,
		MARK_LIMIT_MIN,
		MARK_MAX,
		MARK_MIN,
		markLimitSchema,
		markSchema
	} from '~schemas/textInput';

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
</script>

<div class="flex items-center gap-2">
	<div class="dropdown dropdown-hover dropdown-top">
		<button
			type="button"
			tabindex="0"
			class="m-1"
			on:click={() => (isAdded = !isAdded)}>Enable mark system?</button
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
	<div class="flex flex-col gap-1">
		{#each marks as mark, index}
			<div class="grid grid-cols-4 max-w-[400px] gap-2">
				<TextInputSimple
					title={'Mark ' + (index + 1)}
					titleName={'Mark ' + (index + 1)}
					validationSchema={markSchema}
					min={MARK_MIN}
					max={MARK_MAX}
					doesLimit
					customContainerStyles="col-span-2"
				/>
				<div class="flex items-center col-span-2 gap-1">
					<TextInputSimple
						title={'Limit ' + (index + 1)}
						titleName={'Limit ' + (index + 1)}
						validationSchema={markLimitSchema}
						min={MARK_LIMIT_MIN}
						max={MARK_LIMIT_MAX}
						doesLimit
						trailing="%"
						customContainerStyles="col-span-2"
						inputProperties={{
							type: 'number',
							min: MARK_LIMIT_MIN,
							max: MARK_LIMIT_MAX
						}}
						on:inputChange={(e) => {
							// console.log(e.detail);
						}}
					/>
				</div>
			</div>
		{/each}
	</div>
{/if}
