<script lang="ts">
	import Input from '~components/testTaking/Input.svelte';
	import { testObject } from '~stores/testObject';
	import { initializeTestToTestStore } from '~helpers/test';

	export let data;

	initializeTestToTestStore(data.testContent);
</script>

<h2 class="font-thin text-h3">{data.testContent.title}</h2>
<p class="text-light_text_black_60">{data.testContent.description}</p>
{#each data.testContent.questions as question, index}
	<Input questionIndex={index} />
{/each}
