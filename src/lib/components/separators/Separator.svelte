<script lang="ts">
	export let w: `${number}px` | `${number}%` = '8px';
	export let h: `${number}px` | `${number}%` = '8px';
	export let color: string = 'white';
</script>

<div class="bg-white rounded-full" style="width: {w}; height: {h}; background-color: {color};" />
