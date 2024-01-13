<script lang="ts">
	import TestOverview from '~components/testTaking/TestOverview.svelte';
	import { page } from '$app/stores';
	import { NONAUTHENTICATED_NAV_HEIGHT } from '~components/page-parts/Navbar.svelte';

	export let data;
</script>

<div
	style={`max-height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px - 100px); height: calc(100vh - ${NONAUTHENTICATED_NAV_HEIGHT}px);`}
	class="grid items-center"
>
	<TestOverview
		relatedTests={data.relatedTests.tests
			? data.relatedTests.tests.map((test) => {
					return {
						...test,
						stars: test._count.stars,
						tags: test.tags.map((item) => item.tag),
						type: test.type,
						icon: test.owner.image,
						img: test.imageUrl,
						isStarred: test.stars.length > 0
					};
			  })
			: []}
		isRandomShuffled={data.testContent.randomQuestionOrder}
		viewCount={data.viewCount}
		userViewCount={data.userViewCount}
		testContent={data.testContent}
		testLink={`${$page.url.pathname}/take`}
	/>
</div>
