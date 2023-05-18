<script lang="ts">
	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
	export let customContainerStyles: string = '';

	export let inputValue: HTMLInputElement['value'] = '';
	let inputRef: HTMLInputElement;
</script>

<div
	class="w-full before:content-[''] relative before:absolute before:w-full
  before:h-0.5 before:bg-light_primary before:top-full before:left-0 before:origin-center
	 before:scale-0 before:focus-within:scale-100 before:duration-200 border-b-[0.125rem]
	 border-light_text_black_20 {customContainerStyles}"
>
	<input
		bind:value={inputValue}
		bind:this={inputRef}
		name={titleName}
		id={titleName}
		type="text"
		class="peer outline-none overflow-hidden overflow-ellipsis text-light_text_black px-2 py-4 rounded-t-md shadow-lg w-full {customStyles}"
	/>
	<label
		for={titleName}
		class="absolute text-body1 -translate-y-1/2 left-2 text-light_text_black_20 top-1/2 duration-150 pointer-events-none
		
{inputValue
			? 'text-xs text-[var(--light-text-black-80)] left-4 top-[0px] peer-focus-within:text-primary'
			: ''}">{title}</label
	>
</div>
