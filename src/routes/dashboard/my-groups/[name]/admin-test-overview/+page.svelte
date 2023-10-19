<script lang="ts">
	export let data;
</script>

{#each data['group']['groupsSubcategories'] as subcategory}
	<section>
		<h5>{subcategory.name}</h5>
		<pre>
    <code>
      {JSON.stringify(subcategory, null, 2)}
    </code>
  </pre>
	</section>
{/each}
