<script lang="ts">
	export let title: string;
	export let description: string;
	export let stars: number;
	export let views: number;
	export let author: string;
	export let authorImg: string | null = null;
</script>

<div>
	<h4>{title}</h4>
	<p>{description}</p>
	<div>
		<div>
			<span>{stars}</span>
		</div>
		<div>
			<span>{views}</span>
		</div>
	</div>
</div>
