<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Card from '~components/containers/card/Card.svelte';
	import CardSkeleton from '~components/containers/card/CardSkeleton.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { TestFullType } from '~/Prisma';

	let recentTests: TestFullType[] = [];

	onMount(async () => {
		const res = await trpc($page).getTests.query({
			limit: 3
		});
		recentTests = res as unknown as TestFullType[];
	});
</script>

<h2 class="text-h3 font-extralight text-light_text_black">Test Collection</h2>
<p class="text-body1 text-light_text_black_40">
	Here you can see all your tests which you have created
</p>
<Space />
<h3 class="text-h4 text-light_text_black">Recent activity</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="flex gap-4">
	<!-- <div class="w-full max-w-xs p-5 rounded-md shadow-lg aspect-[5/6] bg-light_white">
		<div class="p-5 text-white rounded-md bg-light_text_black_40">
			<Icon icon="ic:round-plus" class="text-6xl" />
		</div>
	</div> -->
	{#each recentTests as test}
		<Card
			title={test.title}
			description={test.description}
			stars={test.stars}
			tags={test.tags.map((tag) => tag.name)}
		/>
	{/each}
	<!-- <Card
		redirectLink={'#'}
		imageLink={'/imgs/content_imgs/liska.avif'}
		imageAlt={'Liška'}
		title={'Do you know the nature ?'}
		description={'Test your knowladge about the nature which surrounds you.'}
		stars={152}
		views={84201}
		tags={['Nature', 'Animals', 'Plants']}
		/>-->
</div>
<CardSkeleton />

<Space />
<h3 class="text-h4 text-light_text_black">Collection</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />

<style>
	.card_bg {
		background-image: url('/imgs/svgs/card_bg.svg');
	}
</style>
