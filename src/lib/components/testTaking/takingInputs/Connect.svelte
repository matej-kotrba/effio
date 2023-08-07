<script lang="ts">
	import { testObject } from '~stores/testObject';

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<ConnectQuestion> | null =
		null;

	console.log(resultFormat);

	type SvgPositions = {
		ref: SVGElement | undefined;
		x: number | undefined;
		y: number | undefined;
		isDragging: boolean;
	};

	let svgPositions: {
		[key: string]: SvgPositions;
	} = Object.fromEntries(
		$testObject.questions[questionIndex]['content']['answers'].map(
			(_, index) => {
				return [
					index,
					{
						isDragging: false,
						ref: undefined,
						x: undefined,
						y: undefined
					}
				];
			}
		)
	);

	let attachPoints: {
		[key: string]: {
			ref: HTMLDivElement | undefined;
			x: number | undefined;
			y: number | undefined;
		};
	} = Object.fromEntries(
		Object.keys(
			($testObject.questions[questionIndex]['content'] as ConnectQuestion)[
				'matchedAnswers'
			]
		).map((_, index) => [index, { x: undefined, y: undefined, ref: undefined }])
	);

	function onDrag(event: MouseEvent) {
		for (let i in svgPositions) {
			if (svgPositions[i].isDragging && svgPositions[i].ref) {
				const rect = svgPositions[i]!.ref!.getBoundingClientRect();
				svgPositions[i].x = event.clientX - rect.left;
				svgPositions[i].y = event.clientY - rect.top;
			}
		}
	}

	function onMouseUp(event: MouseEvent) {
		let draggingPoint;

		for (let i in svgPositions) {
			if (svgPositions[i].isDragging) {
				draggingPoint = svgPositions[i];
				svgPositions[i].isDragging = false;
			}
		}

		if (!draggingPoint) return;

		// console.log(draggingPoint);

		for (let k in attachPoints) {
			const svgRef = draggingPoint.ref!.getBoundingClientRect();
			console.log(
				'CLIENTX ' + event.clientX,
				'DRAGGINGPOINT.X ' + draggingPoint.x!,
				'ATTACHPOINT.X ' + attachPoints[k].x!,
				'SVGREF.LEFT ' + svgRef.left,
				event.clientX - attachPoints[k].x!
			);
			if (
				Math.abs(event.clientX - attachPoints[k].x!) < 20 &&
				Math.abs(event.clientY - attachPoints[k].y!) < 20
			) {
				draggingPoint.x = attachPoints[k].x! - svgRef.left;
				draggingPoint.y = attachPoints[k].y! - svgRef.top;
				break;
			}
			console.log(attachPoints[k]);
		}
	}

	$: {
		for (let i in attachPoints) {
			if (attachPoints[i].ref) {
				const rect = attachPoints[i].ref!.getBoundingClientRect();
				attachPoints[i].x = rect.left + rect.width / 2;
				attachPoints[i].y = rect.top + rect.height / 2;
			}
		}
	}

	// Update the store based on the selection
	// $: ($testObject.questions[questionIndex]['content'] as ConnectQuestion)[
	// 	'correctAnswerIndex'
	// ] = selectedInput;

	// Update the selectedInput based on the resultFormat
	$: {
		// if (resultFormat) {
		// 	selectedInput = resultFormat.userAnswer.correctAnswerIndex;
		// }
		// console.log(selectedInput);
	}
</script>

<svelte:window on:mousemove={onDrag} on:mouseup={onMouseUp} />
<div class="grid grid-cols-2 gap-2">
	<div class="flex flex-col items-center gap-2">
		{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
			<button
				type="button"
				disabled={!!resultFormat}
				class="w-full flex justify-between px-6 py-3 duration-100 rounded-md shadow-md items-center {resultFormat ===
					null || resultFormat.isCorrect
					? 'bg-white'
					: ''} {!resultFormat && 'hover:bg-slate-50 active:bg-slate-100'} 
			"
			>
				<!-- {resultFormat &&
				resultFormat.isCorrect === false &&
				selectedInput === index &&
				'bg-red-200'} {resultFormat &&
          resultFormat.isCorrect === false &&
          index === resultFormat.correctAnswer.correctAnswerIndex &&
          'bg-green-200'} -->
				<span>{answer}</span>
				<div class="relative grid">
					<!-- <input
						type="radio"
						class="radio radio-primary radio_button"
						disabled={!!resultFormat}
						name={$testObject.questions[questionIndex].title + '-radio'}
						value={index}
						bind:this={inputElements[index]}
					/> -->
					<div
						class="w-6 border-2 rounded-full pointer-events-none bg-light_quaternary aspect-square border-light_secondary"
					>
						<svg
							width="200"
							height="100"
							class="absolute top-[calc(50%)] left-[calc(50%)] overflow-visible z-10"
							bind:this={svgPositions[index].ref}
						>
							<line
								x1="0"
								y1="0"
								x2={svgPositions[index]?.x || 0}
								y2={svgPositions[index]?.y || 0}
								style="stroke:var(--light-quaternary);stroke-width:3"
							/>
							<circle
								cx={svgPositions[index]?.x || 0}
								cy={svgPositions[index]?.y || 0}
								r="8"
								class="pointer-events-auto fill-light_primary"
								on:mousedown={() => (svgPositions[index].isDragging = true)}
							/>
						</svg>
					</div>
				</div></button
			>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
			<button
				type="button"
				disabled={!!resultFormat}
				class="flex justify-between px-6 py-3 duration-100 rounded-md shadow-md {resultFormat ===
					null || resultFormat.isCorrect
					? 'bg-white'
					: ''} {!resultFormat && 'hover:bg-slate-50 active:bg-slate-100'} 
			"
			>
				<!-- {resultFormat &&
				resultFormat.isCorrect === false &&
				selectedInput === index &&
				'bg-red-200'} {resultFormat &&
          resultFormat.isCorrect === false &&
          index === resultFormat.correctAnswer.correctAnswerIndex &&
          'bg-green-200'} -->
				<div class="relative grid">
					<!-- <input
						type="radio"
						class="radio radio-primary radio_button"
						disabled={!!resultFormat}
						name={$testObject.questions[questionIndex].title + '-radio'}
						value={index}
						bind:this={inputElements[index]}
					/> -->
					<div
						class="w-6 bg-transparent border-2 rounded-full pointer-events-none aspect-square border-light_secondary"
						bind:this={attachPoints[index].ref}
					/>
				</div>
				<span>{answer}</span>
			</button>
		{/each}
	</div>
</div>
