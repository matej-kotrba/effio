<script lang="ts">
	export let customStyles: string = '';
</script>

<div
	class="w-fit before:content-[''] relative before:absolute before:w-full
  before:h-0.5 before:bg-light_primary before:bottom-0 before:left-0 before:origin-center before:scale-0"
>
	<input type="text" class="outline-none {customStyles}" />
</div>
