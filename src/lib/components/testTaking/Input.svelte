<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import { testObject } from '~stores/testObject';
	import PickOne from './takingInputs/PickOne.svelte';
	import TrueFalse from './takingInputs/TrueFalse.svelte';
	import Connect from './takingInputs/Connect.svelte';
	import Write from './takingInputs/Write.svelte';
	import Fill from './takingInputs/Fill.svelte';

	type ResultFormat = null | QuestionServerCheckResponse<QuestionContent>;
	export let questionIndex: number;
	export let resultFormat: ResultFormat = null;
	export let isHighlighted = false;
	export let points:
		| {
				max: number;
				got: number;
		  }
		| undefined = undefined;

	$: {
		if (isHighlighted === true) {
			highlight();
		}
	}

	const highlight = () => {
		isHighlighted = true;
		setTimeout(() => {
			isHighlighted = false;
		}, 1500);
	};

	export { classes as class };
	let classes = '';

	let outlineStyles: string;

	$: switch (resultFormat?.isCorrect) {
		case true: {
			outlineStyles = 'outline-success';
			break;
		}
		case false: {
			outlineStyles = 'outline-error dark:outline-dark_error';
			break;
		}
		case 'partial': {
			outlineStyles = 'outline-warning';
			break;
		}
		default: {
			outlineStyles = 'outline-transparent';
			break;
		}
	}

	$: typedResultFormat = resultFormat as any;
</script>

<div
	class={`relative p-3 rounded-md shadow-md bg-light_whiter dark:bg-dark_grey outline-2 outline ${outlineStyles} ${classes}`}
>
	<div
		class="absolute grid w-8 translate-x-1/2 translate-y-1/2 rounded-full shadow-md right-full bottom-full aspect-square place-content-center duration-150
		{isHighlighted
			? 'bg-light_primary dark:bg-dark_primary'
			: 'bg-light_whiter dark:bg-dark_light_grey'}"
	>
		{questionIndex + 1}
	</div>
	<div class="flex items-center justify-between">
		<p class="text-light_text_black dark:text-dark_text_white_40 text-body2">
			{$testObject.questions[questionIndex].displayType}
		</p>
		{#if points}
			<div
				class="p-2 text-sm rounded-md bg-light_white dark:bg-dark_light_grey"
			>
				<span>{points.got}</span>/<span>{points.max}</span>
			</div>
		{/if}
	</div>
	<div class="p-2">
		<h4 class="text-light_text_black dark:text-dark_text_white text-h4">
			{$testObject.questions[questionIndex].title}
		</h4>
		<Space gap={15} />
		{#if $testObject['questions'][questionIndex]['questionType'] === 'pickOne'}
			<PickOne
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'pickOne'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'true/false'}
			<TrueFalse
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'true/false'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'connect'}
			<Connect
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'connect'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'write'}
			<Write
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'write'
					? typedResultFormat
					: null}
			/>
		{:else if $testObject['questions'][questionIndex]['questionType'] === 'fill'}
			<Fill
				{questionIndex}
				resultFormat={resultFormat &&
				resultFormat['userAnswer']['type'] === 'fill'
					? typedResultFormat
					: null}
			/>
		{/if}
	</div>
</div>
