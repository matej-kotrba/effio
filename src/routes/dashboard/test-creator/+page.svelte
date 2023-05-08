<script lang="ts">
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import TemplateCard from '~components/containers/TemplateCard.svelte';

	let templateDone: boolean = false;
	let constructingDone: boolean = false;
	let detailsDone: boolean = false;
</script>

<h2 class="text-h3 font-extralight text-light_text_black">Create your new test</h2>
<p class="text-body1 text-light_text_black_40">
	Choose a template and make a new test using many prebuilt inputs.
</p>
<Space />
<div class="text-sm breadcrumbs">
	<ul>
		<li class="text-light_text_black_60 text-body2" class:done={templateDone}>
			Picking a template
		</li>
		<li class="text-light_text_black_60 text-body2" class:done={constructingDone}>
			Constructing a test
		</li>
		<li class="text-light_text_black_60 text-body2" class:done={detailsDone}>Details</li>
	</ul>
</div>
<h3 class="text-h4 text-light_text_black">Start with picking a template</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<TemplateCard title="Blank test" imageSrc="/imgs/svgs/empty.svg" />

<style>
	li::before {
		color: var(--light-primary);
		font-weight: 800;
	}
	.done {
		color: var(--light-primary);
	}
</style>
