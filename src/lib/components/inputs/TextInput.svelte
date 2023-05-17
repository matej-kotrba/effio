<script lang="ts">
	export let title: string;
	export let titleName: string;
	export let customStyles: string = '';
</script>

<div
	class="w-fit before:content-[''] relative before:absolute before:w-full
  before:h-0.5 before:bg-light_primary before:top-full before:left-0 before:origin-center
	 before:scale-0 before:focus-within:scale-100 before:duration-200 border-b-[0.125rem]
	 border-light_text_black_20"
>
	<label for={titleName}>{title}</label>
	<input
		name={titleName}
		id={titleName}
		type="text"
		class="outline-none overflow-hidden overflow-ellipsis text-light_text_black p-2 {customStyles}"
	/>
</div>
