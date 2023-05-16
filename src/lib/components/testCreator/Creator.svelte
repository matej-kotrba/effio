<script lang="ts">
	import Icon from '@iconify/svelte';
	import { clickOutside } from '~use/clickOutside';
	import Input from '~components/testCreator/Input.svelte';
	import CreateNewInput from './CreateNewInput.svelte';

	export let inputs: QuestionType[] = [];

	// const usedInputsReferences: Input[] = [];

	// function checkTestResult() {
	// 	console.log(usedInputsReferences[0].checkResult());
	// }

	// onMount(() => {
	// 	checkTestResult();
	// });

	let openDropdown = false;
	let inputTypeCreation: QuestionContent['inputType'] | null = null;
</script>

<div class="p-2 bg-light_white roudned-md text-light_text_black">
	<div class="relative flex flex-col items-center justify-center gap-2">
		<div class="flex flex-row items-center w-full gap-4 px-4">
			<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
			<button
				class="relative z-10 p-2 duration-200 rounded-lg bg-light_secondary text-whiter hover:bg-primary"
				on:click={() => (openDropdown = !openDropdown)}
			>
				<Icon icon="ic:round-plus" class="text-5xl rounded-lg text-light_white" />
			</button>
			<div class="w-full rounded-full h-0.5 bg-light_text_black_40" />
			<div
				use:clickOutside
				on:clickoutside={() => (openDropdown = false)}
				class="absolute right-0 w-full grid_layout gap-4 p-4 absoluteContainer z-30
				rounded-md shadow-lg bottom-[calc(100%+10px)] bg-light_whiter duration-200
				{openDropdown ? '' : 'opacity-0 pointer-events-none'}"
			>
				{#each inputs as input}
					<button
						on:click={() => {
							inputTypeCreation = input['properties']['inputType'];
							openDropdown = false;
						}}
						class="grid w-full rounded-md aspect-square text-light_whiter bg-light_primary place-content-center"
					>
						{input.name}
					</button>
				{/each}
			</div>
		</div>
		<Input inputType="pickOne" displayType="Pick One" />
		<Input inputType="true/false" displayType="True / False" />
	</div>
</div>

<style>
	.grid_layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		overflow-y: scroll;
		max-height: 250px;
	}

	/* width */
	.absoluteContainer::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	.absoluteContainer::-webkit-scrollbar-track {
		background: var(--light-text-black-20);
		border-radius: 50px;
	}

	/* Handle */
	.absoluteContainer::-webkit-scrollbar-thumb {
		background: var(--light-terciary);
		border-radius: 50px;
	}

	/* Handle on hover */
	.absoluteContainer::-webkit-scrollbar-thumb:hover {
		background: var(--light-secondary);
	}
</style>
