<script lang="ts">
	import IconButton from '~components/buttons/IconButton.svelte';

	type Mock = {
		name: string;
		checked: string;
		color: string;
	};

	// Create 10 mock items
	const mock: Mock[] = [
		{
			name: 'Item 1',
			checked: 'true',
			color: 'red'
		},
		{
			name: 'Item 2',
			checked: 'false',
			color: 'blue'
		},
		{
			name: 'Item 3',
			checked: 'true',
			color: 'green'
		},
		{
			name: 'Item 4',
			checked: 'false',
			color: 'yellow'
		},
		{
			name: 'Item 5',
			checked: 'true',
			color: 'red'
		},
		{
			name: 'Item 6',
			checked: 'false',
			color: 'blue'
		},
		{
			name: 'Item 7',
			checked: 'true',
			color: 'green'
		},
		{
			name: 'Item 8',
			checked: 'false',
			color: 'yellow'
		},
		{
			name: 'Item 9',
			checked: 'true',
			color: 'red'
		},
		{
			name: 'Item 10',
			checked: 'false',
			color: 'blue'
		}
	];
</script>

<div class="w-[500px] p-2 m-2 bg-gray-200 rounded-md">
	<div class="flex gap-2">
		{#each mock.filter((item) => item['checked']) as item, i}
			<div class="px-4 py-2 rounded-full whitespace-nowrap bg-slate-400">
				<IconButton tooltip="Remove" icon="ic:round-close" />
				<span style="color: {item.color}">{item.name}</span>
			</div>
		{/each}
	</div>
</div>
