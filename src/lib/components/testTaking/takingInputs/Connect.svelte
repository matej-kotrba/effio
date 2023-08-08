<script lang="ts">
	import { testObject } from '~stores/testObject';

	const wrongAnswerHiglightColors = [
		'#4169e130',
		'#2ecc7130',
		'#e74c3c30',
		'#f39c1230',
		'#8e44ad30',
		'#ff9f4330',
		'#00ced130',
		'#e91e6330',
		'#9370db30',
		'#8b451330'
	];

	export let questionIndex: number;
	export let resultFormat: QuestionServerCheckResponse<ConnectQuestion> | null =
		null;

	type SvgPositions = {
		ref: SVGElement | undefined;
		x: number | undefined;
		y: number | undefined;
		isDragging: boolean;
	};

	let isDragging = false;

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
		if (!isDragging) return;

		if (resultFormat) return;
		for (let i in svgPositions) {
			if (svgPositions[i].isDragging && svgPositions[i].ref) {
				const rect = svgPositions[i]!.ref!.getBoundingClientRect();
				svgPositions[i].x = event.clientX - rect.left;
				svgPositions[i].y = event.clientY - rect.top;
			}
		}
	}

	function onMouseUp(event: MouseEvent) {
		if (resultFormat) return;
		let draggingPoint;
		let draggingIndex: number | undefined;

		isDragging = false;
		for (let i in svgPositions) {
			if (svgPositions[i].isDragging) {
				draggingPoint = svgPositions[i];
				draggingIndex = +i;
				svgPositions[i].isDragging = false;
			}
		}

		if (!draggingPoint || draggingIndex === undefined) return;
		// console.log(draggingPoint);

		// Calculate the distance between the dragging point and the attach points and stick the connection to the closest one
		for (let k in attachPoints) {
			const svgRef = draggingPoint.ref!.getBoundingClientRect();
			const keys = Object.keys(
				($testObject.questions[questionIndex]['content'] as ConnectQuestion)
					.matchedAnswers
			);
			const usedKeys = (
				$testObject.questions[questionIndex]['content'] as ConnectQuestion
			).answers.map((item) => item.matchedAnswerIndex);

			if (
				Math.abs(event.clientX - attachPoints[k].x!) < 20 &&
				Math.abs(event.clientY - attachPoints[k].y!) < 20 &&
				!usedKeys.includes(keys[+k])
			) {
				draggingPoint.x = attachPoints[k].x! - svgRef.left;
				draggingPoint.y = attachPoints[k].y! - svgRef.top;
				const key = Object.keys(
					($testObject.questions[questionIndex]['content'] as ConnectQuestion)
						.matchedAnswers
				)[+k];
				// ($testObject.questions[questionIndex]["content"] as ConnectQuestion).matchedAnswers[key] = draggingPoint.
				(
					$testObject.questions[questionIndex]['content'] as ConnectQuestion
				).answers[draggingIndex].matchedAnswerIndex = key;
				return;
			}
		}

		(
			$testObject.questions[questionIndex]['content'] as ConnectQuestion
		).answers[draggingIndex].matchedAnswerIndex = undefined;
		draggingPoint.x = undefined;
		draggingPoint.y = undefined;
	}

	function calculateBoxCoords() {
		for (let i in attachPoints) {
			if (attachPoints[i].ref) {
				const rect = attachPoints[i].ref!.getBoundingClientRect();
				attachPoints[i].x = rect.left + rect.width / 2;
				attachPoints[i].y = rect.top + rect.height / 2;
			}
		}
	}

	$: for (let i in attachPoints) {
		if (attachPoints[i].ref) {
			const rect = attachPoints[i].ref!.getBoundingClientRect();
			attachPoints[i].x = rect.left + rect.width / 2;
			attachPoints[i].y = rect.top + rect.height / 2;
		}
	}

	$: content = $testObject.questions[questionIndex][
		'content'
	] as ConnectQuestion;

	// Update the selectedInput based on the resultFormat
	$: {
		// if (resultFormat) {
		// 	selectedInput = resultFormat.userAnswer.correctAnswerIndex;
		// }
		// console.log(selectedInput);
	}
</script>

<svelte:window
	on:mousemove={onDrag}
	on:mouseup={onMouseUp}
	on:resize={calculateBoxCoords}
	on:scroll={calculateBoxCoords}
/>
<div class="grid grid-cols-2 gap-2">
	<div class="flex flex-col items-center gap-2">
		{#each $testObject.questions[questionIndex]['content']['answers'] as { answer }, index}
			<button
				type="button"
				disabled={!!resultFormat}
				class="w-full flex justify-between px-6 py-3 duration-100 rounded-md shadow-md items-center {resultFormat ===
					null || resultFormat.isCorrect
					? 'bg-white'
					: ''} {!resultFormat && 'hover:bg-slate-50 active:bg-slate-100'}"
				style="background-color: {resultFormat &&
					resultFormat.isCorrect === false &&
					wrongAnswerHiglightColors[index]};"
			>
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
								class:duration-150={!svgPositions[index].isDragging}
								on:mousedown={() => {
									svgPositions[index].isDragging = true;
									isDragging = true;
								}}
							/>
						</svg>
					</div>
				</div></button
			>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		{#each Object.values(content['matchedAnswers']) as text, index}
			<button
				type="button"
				disabled={!!resultFormat}
				class="flex justify-between px-6 py-3 duration-100 rounded-md shadow-md {resultFormat ===
					null || resultFormat.isCorrect
					? 'bg-white'
					: ''}
			"
				style="background-color: {resultFormat &&
					resultFormat.isCorrect === false &&
					wrongAnswerHiglightColors[
						resultFormat['correctAnswer']['answers'].findIndex(
							(item) =>
								item.matchedAnswerIndex ===
								Object.keys(content['matchedAnswers'])[index]
						)
					]};"
			>
				<div class="relative grid">
					<div
						class="w-6 bg-transparent border-2 rounded-full pointer-events-none aspect-square border-light_secondary"
						bind:this={attachPoints[index].ref}
					/>
				</div>
				<span>{text}</span>
			</button>
		{/each}
	</div>
</div>