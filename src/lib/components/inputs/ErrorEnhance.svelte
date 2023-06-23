<script lang="ts">
	let error = '';
</script>

<div
	on:error={(e) => {
		console.log('adasdsd');
		error = e.detail;
	}}
>
	<slot />
	<p class={`text-body2 text-error ${error ? 'opacity-100' : 'opacity-0'}`}>
		{error || 'Placeholder error'}
	</p>
</div>
