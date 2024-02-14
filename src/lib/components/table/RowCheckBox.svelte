<script lang="ts">
	export let checked: boolean,
		indeterminate: HTMLInputElement['indeterminate'],
		disabled: boolean = false,
		onChange: (e: Event) => void;
</script>

<input
	class="checkbox"
	type="checkbox"
	on:change={onChange}
	{checked}
	bind:indeterminate
	{disabled}
/>
