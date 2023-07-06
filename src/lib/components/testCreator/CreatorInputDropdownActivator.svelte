<script lang="ts">
	export let isVisible: boolean = false;
</script>

<div
	class="w-[90%] mx-auto h-1 rounded-full bg-light_primary duration-150 {isVisible
		? 'opacity-100'
		: 'opacity-0'}"
/>
