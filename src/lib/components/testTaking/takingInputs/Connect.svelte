<script lang="ts">
	import { applicationStates } from '~stores/applicationStates';
	import type { TestObject } from '~stores/testObject';
	import Comment from '../Comment.svelte';

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

	export let testObject: TestObject;
	export let questionIndex: number;

	$: content = testObject.questions[questionIndex][
		'content'
	] as ConnectQuestion;

	export let resultFormat: QuestionServerCheckResponse<ConnectQuestion> | null =
		null;

	type SvgPositions = {
		ref: SVGElement | undefined;
		x: number | undefined;
		y: number | undefined;
		isDragging: boolean;
	};

	let isDragging = false;
	let selectedPointIndex: number | undefined = undefined;
	let touchDeviceBlock = false;

	let svgPositions: {
		[key: string]: SvgPositions;
	} = Object.fromEntries(
		(testObject.questions[questionIndex]['content'] as ConnectQuestion)[
			'answers'
		].map((_, index) => {
			return [
				index,
				{
					isDragging: false,
					ref: undefined,
					x: undefined,
					y: undefined
				}
			];
		})
	);

	let attachPoints: {
		[key: string]: {
			ref: HTMLDivElement | undefined;
			x: number | undefined;
			y: number | undefined;
		};
	} = Object.fromEntries(
		Object.keys(
			(testObject.questions[questionIndex]['content'] as ConnectQuestion)[
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

	function onMouseUp(event: MouseEvent, index?: number) {
		if (touchDeviceBlock) return;
		if (resultFormat) return;
		let draggingPoint;
		let draggingIndex: number | undefined;

		isDragging = false;

		if (selectedPointIndex !== undefined && index !== undefined) {
			draggingIndex = selectedPointIndex;
			draggingPoint = svgPositions[selectedPointIndex];
			svgPositions[selectedPointIndex].isDragging = false;
			selectedPointIndex = undefined;
		} else {
			for (let i in svgPositions) {
				if (svgPositions[i].isDragging) {
					draggingPoint = svgPositions[i];
					draggingIndex = +i;
					svgPositions[i].isDragging = false;
				}
			}
		}

		if (!draggingPoint || draggingIndex === undefined) return;

		const svgRef = draggingPoint.ref!.getBoundingClientRect();
		const keys = Object.keys(
			(testObject.questions[questionIndex]['content'] as ConnectQuestion)
				.matchedAnswers
		);
		const usedKeys = (
			testObject.questions[questionIndex]['content'] as ConnectQuestion
		).answers.map((item) => item.matchedAnswerIndex);

		if (index !== undefined) {
			if (usedKeys.includes(keys[index])) return;
			draggingPoint.x = attachPoints[index].x! - svgRef.left;
			draggingPoint.y = attachPoints[index].y! - svgRef.top;
			const key = Object.keys(
				(testObject.questions[questionIndex]['content'] as ConnectQuestion)
					.matchedAnswers
			)[index];
			(
				testObject.questions[questionIndex]['content'] as ConnectQuestion
			).answers[draggingIndex].matchedAnswerIndex = key;
			return;
		} else {
			// Calculate the distance between the dragging point and the attach points and stick the connection to the closest one
			for (let k in attachPoints) {
				if (
					Math.abs(event.clientX - attachPoints[k].x!) < 20 &&
					Math.abs(event.clientY - attachPoints[k].y!) < 20 &&
					!usedKeys.includes(keys[+k])
				) {
					draggingPoint.x = attachPoints[k].x! - svgRef.left;
					draggingPoint.y = attachPoints[k].y! - svgRef.top;
					const key = Object.keys(
						(testObject.questions[questionIndex]['content'] as ConnectQuestion)
							.matchedAnswers
					)[+k];
					// (testObject.questions[questionIndex]["content"] as ConnectQuestion).matchedAnswers[key] = draggingPoint.
					(
						testObject.questions[questionIndex]['content'] as ConnectQuestion
					).answers[draggingIndex].matchedAnswerIndex = key;
					return;
				}
			}

			(
				testObject.questions[questionIndex]['content'] as ConnectQuestion
			).answers[draggingIndex].matchedAnswerIndex = undefined;
			draggingPoint.x = undefined;
			draggingPoint.y = undefined;
		}
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

	$: {
		if (resultFormat) {
			for (let i in attachPoints) {
				if (attachPoints[i].ref) {
					const rect = attachPoints[i].ref!.getBoundingClientRect();
					attachPoints[i].x = rect.left + rect.width / 2;
					attachPoints[i].y = rect.top + rect.height / 2;
				}
			}
			const keys = Object.entries(resultFormat.userAnswer.matchedAnswers)
				.sort((a, b) => {
					return a[1].displayId - b[1].displayId;
				})
				.map((item) => item[0]);

			for (let i in svgPositions) {
				if (!svgPositions[i].ref) continue;
				const svgRef = svgPositions[i].ref!.getBoundingClientRect();
				const pointToAttach =
					attachPoints[
						keys.indexOf(
							resultFormat.userAnswer.answers[+i].matchedAnswerIndex!
						)
					];
				svgPositions[i].x = pointToAttach.x! - svgRef.left;
				svgPositions[i].y = pointToAttach.y! - svgRef.top;
			}
		}
	}

	$: sortedMatchedAnswers = Object.values(content['matchedAnswers']).sort(
		(a, b) => a.displayId - b.displayId
	);
</script>

<svelte:window
	on:mousemove={onDrag}
	on:mouseup={onMouseUp}
	on:resize={calculateBoxCoords}
	on:scroll={calculateBoxCoords}
/>
<div class="grid grid-cols-2 gap-2">
	<div class="flex flex-col items-center gap-2">
		{#each content['answers'] as { answer }, index}
			<button
				type="button"
				disabled={!!resultFormat}
				class="w-full flex justify-between px-6 py-3 duration-100 rounded-md shadow-md items-center {resultFormat ===
					null || resultFormat.isCorrect
					? 'bg-white dark:bg-dark_light_grey'
					: ''} {!resultFormat && 'hover:bg-slate-50 active:bg-slate-100'}"
				style="background-color: {resultFormat &&
					resultFormat.isCorrect !== true &&
					wrongAnswerHiglightColors[index]};"
			>
				<span>{answer}</span>
				<div class="relative grid">
					<!-- <input
						type="radio"
						class="radio radio-primary radio_button"
						disabled={!!resultFormat}
						name={testObject.questions[questionIndex].title + '-radio'}
						value={index}
						bind:this={inputElements[index]}
					/> -->
					<div
						class={`w-6 border-2 rounded-full pointer-events-none bg-light_quaternary dark:bg-dark_quaternary 
						aspect-square border-light_secondary dark:border-dark_secondary ${
							selectedPointIndex === index
								? 'border-2 border-yellow-400 dark:border-yellow-400'
								: ''
						}`}
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
								style={`stroke:var(${
									$applicationStates['darkMode']['isDarkMode']
										? '--dark-terciary'
										: '--light-terciary'
								});stroke-width:3`}
							/>
							<circle
								tabindex="0"
								role="button"
								cx={svgPositions[index]?.x || 0}
								cy={svgPositions[index]?.y || 0}
								r="8"
								class="pointer-events-auto fill-light_primary dark:fill-dark_primary"
								class:duration-150={!svgPositions[index].isDragging}
								on:mousedown={() => {
									svgPositions[index].isDragging = true;
									isDragging = true;
								}}
								on:touchstart|stopPropagation={() => {
									selectedPointIndex = index;
									for (const key in svgPositions) {
										svgPositions[key].isDragging = false;
									}
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
		{#each sortedMatchedAnswers as text, index}
			{@const sortedMatchedAnsweres = Object.keys(
				content['matchedAnswers']
			).sort(
				(a, b) =>
					content['matchedAnswers'][a].displayId -
					content['matchedAnswers'][b].displayId
			)}
			{@const matchedId = resultFormat
				? resultFormat['correctAnswer']['answers'].find(
						(item) => item.matchedAnswerIndex === sortedMatchedAnsweres[index]
				  )?.id
				: undefined}
			<button
				type="button"
				disabled={!!resultFormat}
				on:touchstart={(e) => {
					//@ts-expect-error In this case it does not matter
					onMouseUp(e, index);
					touchDeviceBlock = true;
					setTimeout(() => {
						touchDeviceBlock = false;
					}, 100);
				}}
				class="flex justify-between px-6 py-3 duration-100 rounded-md shadow-md {resultFormat ===
					null || resultFormat.isCorrect
					? 'bg-white dark:bg-dark_light_grey'
					: ''}
			"
				style="background-color: {resultFormat &&
					resultFormat.isCorrect !== true &&
					matchedId !== undefined &&
					wrongAnswerHiglightColors[
						resultFormat['userAnswer']['answers'].findIndex(
							(item) => item.id === matchedId
						)
						// resultFormat['correctAnswer']['answers'].findIndex(
						// 	(item) =>
						// 		item.matchedAnswerIndex ===
						// 		Object.keys(content['matchedAnswers'])[index]
						// )
					]};"
			>
				<div class="relative grid">
					<div
						class={`w-6 bg-transparent border-2 rounded-full aspect-square border-light_secondary dark:border-dark_secondary `}
						bind:this={attachPoints[index].ref}
					/>
				</div>
				<span>{text.answer}</span>
			</button>
			{#if resultFormat && resultFormat.correctAnswer.answers[index].response}
				<Comment
					response={resultFormat.correctAnswer.answers[index].response}
				/>
			{/if}
		{/each}
	</div>
</div>
