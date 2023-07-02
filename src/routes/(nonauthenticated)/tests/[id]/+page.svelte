<script lang="ts">
	import Input from '~components/testTaking/Input.svelte';
	import { testObject } from '~stores/testObject';
	import { initializeTestToTestStore } from '~helpers/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';

	export let data;

	initializeTestToTestStore(data.testContent);

	$: console.log($testObject.questions);
</script>

<div class="mx-auto max-w-[650px]">
	<h2 class="font-thin text-h3">{data.testContent.title}</h2>
	<p class="text-light_text_black_60">{data.testContent.description}</p>
	<Space gap={40} />
	{#each data.testContent.questions as _, index}
		<Input questionIndex={index} />
	{/each}
	<Space gap={40} />
	<BasicButton title={'Check'} onClick={() => {}} class="ml-auto" />
</div>
