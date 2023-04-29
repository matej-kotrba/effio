<script lang="ts">
	import Icon from '@iconify/svelte';
	import Separator from '../separators/Separator.svelte';
</script>

<footer class="relative flex items-center gap-10 px-10 py-20 bg-light_text_black">
	<div class="flex flex-col justify-center w-max">
		<h5 class="text-center text-light_white text-h5">Do you like Effio?</h5>
		<span class="text-center text-light_grey text-body2">Leave a star on GitHub</span>
		<Icon icon="mdi:github" class="mx-auto text-[3rem] text-light_white" />
	</div>
	<Separator h="80px" w="4px" color="white" />
</footer>
