<script lang="ts">
	import Icon from '@iconify/svelte';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import { fade, fly } from 'svelte/transition';

	let templateDone: boolean = false;
	let constructingDone: boolean = false;
	let detailsDone: boolean = false;

	let templates: { title: string; image: string }[] = [
		{ title: 'Blank test', image: '/imgs/svgs/empty.svg' }
	];
	let templatesActive: number | undefined = undefined;
</script>

<h2 class="text-h3 font-extralight text-light_text_black">Create your new test</h2>
<p class="text-body1 text-light_text_black_40">
	Choose a template and make a new test using many prebuilt inputs.
</p>
<Space />
<div class="text-sm breadcrumbs">
	<ul>
		<li class="text-light_text_black_80 text-body2" class:done={templateDone}>
			Picking a template
		</li>
		<li class="text-light_text_black_80 text-body2" class:done={constructingDone}>
			Constructing a test
		</li>
		<li class="text-light_text_black_80 text-body2" class:done={detailsDone}>Details</li>
	</ul>
</div>
<!-- <ProgressNavigation
	parts={[
		{ title: 'Picking a template', onClick: () => {}, buttonProps: { disabled: false } },
		{ title: 'Constructing a test', onClick: () => {}, buttonProps: { disabled: true } },
		{ title: 'Details', onClick: () => {}, buttonProps: { disabled: true } }
	]}
	color={'var(--light-primary)'}
/> -->
<h3 class="text-h4 text-light_text_black">Start with picking a template</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
{#if templateDone === false}
	<div
		in:fly={{ x: -300, duration: 500, delay: 500 }}
		out:fly={{ x: -300, duration: 500 }}
		class="overflow-hidden"
	>
		{#each templates as template, index}
			<TemplateCard
				title={template.title}
				imageSrc={template.image}
				onClick={() => (templatesActive = index)}
				customClasses={index === templatesActive
					? ' border-light_primary border-4 border-solid shadow-primary shadow-2xl'
					: ' border-transparent border-4 border-solid'}
			/>
		{/each}
		<Space />

		<BasicButton
			title="Continue"
			onClick={() => {
				templateDone = true;
			}}
			buttonAttributes={{ disabled: templatesActive === undefined }}
		>
			<Icon icon="bxs:right-arrow" class="text-md" />
		</BasicButton>
	</div>
	<!-- Else if  -->
{:else if constructingDone === false}
	<div
		in:fly={{ x: 300, duration: 500, delay: 500 }}
		out:fly={{ x: -300, duration: 500 }}
		class="overflow-hidden"
	>
		<Space />

		<BasicButton
			title="Continue"
			onClick={() => {
				templateDone = true;
			}}
			buttonAttributes={{ disabled: templatesActive === undefined }}
		>
			<Icon icon="bxs:right-arrow" class="text-md" />
		</BasicButton>
	</div>
{:else}
	asd
{/if}

<style>
	.done {
		color: var(--light-primary);
	}
</style>
