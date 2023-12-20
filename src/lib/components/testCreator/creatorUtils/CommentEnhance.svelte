<script lang="ts">
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import {
		RESPONSE_MAX,
		RESPONSE_MIN,
		responseSchema
	} from '~schemas/textInput';
	import { clickOutside } from '~use/clickOutside';

	export let asnwerPath: Answer<unknown>;
	export let displayType: 'up' | 'side' = 'side';
	export let displayOnHover: boolean = true;
	export let staticDisplay: boolean = false;

	let classes = '';
	export { classes as class };

	let toggled = false;
</script>

<div
	class={twMerge('relative cursor-default group/comment', classes)}
	use:clickOutside
	on:clickoutside={() => (toggled = false)}
>
	{#if toggled}
		<div
			transition:fade={{ duration: 100 }}
			class="absolute left-0 w-full bg-light_grey_dark shadow-md rounded-sm bottom-4 z-[20] p-2 md:p-4"
		>
			<div class="flex justify-between items-centers text-body1">
				<span>Response for the answer</span>
				<button
					class=""
					type="button"
					on:click={() => {
						toggled = false;
					}}
				>
					<iconify-icon
						icon="ic:round-close"
						class="grid text-2xl duration-100 text-light_text_black dark:text-dark_text_white hover:text-error dark:hover:text-dark_error place-content-center"
					/>
				</button>
			</div>
			<span
				class="text-light_text_black_60 dark:text-dark_text_white_60 text-body2"
				>* Shows if user picks this answer</span
			>
			<ErrorEnhance>
				<TextAreaInput
					min={RESPONSE_MIN}
					max={RESPONSE_MAX}
					doesLimit={true}
					title="Response"
					titleName="Response"
					validationSchema={responseSchema}
					bind:inputValue={asnwerPath.response}
				/>
			</ErrorEnhance>
		</div>
	{/if}
	{#if staticDisplay === true}
		<div class="flex justify-end">
			<button
				type="button"
				on:click={() => {
					toggled = true;
				}}
				class={`duration-150 z-10 p-2 border-2 border-solid rounded-md bg-light_whiter border-light_text_black_80`}
			>
				<iconify-icon
					icon="solar:clipboard-linear"
					class="grid text-xl place-content-center"
				/>
			</button>
		</div>
	{:else}
		<button
			type="button"
			on:click={() => {
				toggled = true;
			}}
			class={`absolute duration-150
		${
			displayOnHover
				? 'group-hover/comment:opacity-100 sm:opacity-0 opacity-100'
				: 'opacity-100'
		}
		${
			displayType === 'up'
				? 'top-0 right-2 -translate-y-1/2'
				: displayType === 'side'
				? 'top-0 right-0 translate-x-1/2'
				: ''
		} z-10 p-1 border-2 border-solid rounded-full bg-light_whiter border-light_text_black_80`}
		>
			<iconify-icon
				icon="solar:clipboard-linear"
				class="grid text-xl place-content-center"
			/>
		</button>
	{/if}
	<slot />
</div>
