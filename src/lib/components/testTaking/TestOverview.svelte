<script lang="ts">
	import { initializeTestToTestStore } from '~helpers/test/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte';
	import { getTestObject } from '~stores/testObject';
	import SimpleButton from '~components/buttons/SimpleButton.svelte';
	import Star from '~components/globals/Star.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import Separator from '~components/separators/Separator.svelte';
	import TagContainer from '~components/containers/tag/TagContainer.svelte';
	import Carousel, {
		type IdCardAlternativeProps
	} from '~components/containers/Carousel.svelte';
	import { createTRPCErrorNotification } from '~utils/notification';
	import { TRPCClientError } from '@trpc/client';

	type TestContentRaw = NonNullable<
		Awaited<ReturnType<ReturnType<typeof trpc>['getTestById']['query']>>
	>;

	export let testContent: ExcludePick<TestContentRaw, 'subcategories'>;

	export let testLink: string;

	export let viewCount: number = -1;
	export let userViewCount: number = -1;
	export let isRandomShuffled: boolean = true;
	export let relatedTests: IdCardAlternativeProps[] = [];
	export let displayRelatedTests: boolean = true;

	const testObject = getTestObject();

	initializeTestToTestStore(testObject, testContent);

	let markSystem: MarkSystemJSON['marks'] | null = checkMarkSystem(
		testContent.testVersions[0].markSystemJSON
	);

	let canStarTest = testContent.ownerId !== $page.data.session?.user?.id;
	let isSubmittingStar = false;
	let isStarred = testContent.stars.length > 0;

	async function starTest() {
		if (
			canStarTest === false ||
			testContent._count.stars === undefined ||
			isSubmittingStar === true
		)
			return;
		if (isStarred === false) {
			try {
				isSubmittingStar = true;
				isStarred = true;
				testContent._count.stars += 1;
				await trpc($page).protected.starTest.mutate({
					testGroupId: testContent.id
				});
			} catch (e) {
				testContent._count.stars -= 1;
				isStarred = false;
				if (e instanceof TRPCClientError) {
					createTRPCErrorNotification(e);
				}
			} finally {
				isSubmittingStar = false;
			}
		} else if (isStarred === true) {
			try {
				isSubmittingStar = true;
				isStarred = false;
				testContent._count.stars -= 1;
				await trpc($page).protected.starTest.mutate({
					testGroupId: testContent.id,
					decrement: true
				});
			} catch (e) {
				testContent._count.stars += 1;
				isStarred = true;
				if (e instanceof TRPCClientError) {
					createTRPCErrorNotification(e);
				}
			} finally {
				isSubmittingStar = false;
			}
		}
	}
</script>

<div class="max-w-[1200px] w-full mx-auto p-3 rounded-md">
	<h3 class="text-h3 font-extralight">Test overview</h3>
	<div class="grid gap-4 md:grid-cols-2">
		<div>
			<div class="p-2">
				<p class="mb-3">
					<span
						class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
						>Test name:</span
					><br />{testContent.title}
				</p>
				<p class="mb-3">
					<span
						class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
						>Test description:</span
					><br />{testContent.description}
				</p>
				<div class="flex items-center gap-2 mb-3">
					<span
						class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
						>Author:</span
					><span class="font-semibold text-body1">{testContent.owner.name}</span
					>
					<div class="dropdown dropdown-hover dropdown-top">
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label tabindex="0">
							<img
								src={testContent.owner.image}
								class="w-12 rounded-full"
								alt="Author"
							/>
						</label>
						<div
							class="dropdown-content z-[1] menu p-2 bg-base-100 dark:bg-dark_light_grey rounded-box w-52 shadow-md"
						>
							<p class="text-light_text_black dark:text-dark_text_white">
								{testContent.owner.name}
							</p>
						</div>
					</div>
				</div>
				<div>
					{#if testContent.type !== 'PROGRAMMING'}
						<span
							class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
							>Is test randomly suhffled:</span
						>
						<span class="font-bold text-h6"
							>{isRandomShuffled ? 'Yes' : 'No'}</span
						>
					{/if}
				</div>
				{#if testContent.tags.length > 0}
					<div>
						<span
							class="font-semibold text-light_text_black_60 dark:text-dark_text_white_60"
							>Test tags:</span
						><br />
						<div class="flex flex-wrap w-full gap-1">
							{#each testContent.tags as tag}
								<TagContainer
									color={tag.tag.color}
									title={tag.tag.name}
									isActive={false}
									isDisabled={true}
								/>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<Space gap={30} />
			<a href={testLink}>
				<BasicButton title="Take test" />
			</a>
		</div>
		<div>
			<div class="flex items-stretch justify-end gap-1">
				<SimpleButton
					onClick={starTest}
					class={`${isStarred ? 'bg-light_star dark:bg-dark_star' : ''}`}
				>
					<div class="flex items-center gap-1">
						<Star />
						{testContent?._count.stars}
					</div>
				</SimpleButton>
				<SimpleButton class="grid place-content-center">
					<iconify-icon icon="emojione-monotone:exclamation-mark" />
				</SimpleButton>
			</div>
			{#if viewCount >= 0}
				<div class="flex items-center justify-end gap-1">
					<span class="font-semibold text-h6">Total attempts: {viewCount}</span>
					<div class="grid place-content-center">
						<iconify-icon icon="lets-icons:view-alt-fill" class="text-2xl" />
					</div>
				</div>
			{/if}
			{#if userViewCount >= 0}
				<div class="flex items-center justify-end gap-1">
					<span class="font-semibold text-h6"
						>Your attempts: {userViewCount}</span
					>
					<div class="grid place-content-center">
						<iconify-icon icon="mdi:user" class="text-2xl" />
					</div>
				</div>
			{/if}
			<h4 class="font-semibold text-h6">Marking</h4>
			<Separator w={'100%'} h={'1px'} />
			<div class="flex items-center gap-1">
				{#if markSystem}
					<div class="w-full overflow-x-auto">
						<table class="table text-body2">
							<!-- head -->
							<thead>
								<tr
									class="text-light_text_black_80 dark:text-dark_text_white_80"
								>
									<th class="text-body1">Percentage %</th>
									<th class="text-body1">Mark</th>
								</tr>
							</thead>
							<tbody>
								{#each markSystem as mark, index}
									{@const prevValue =
										index === 0 ? 100 : (markSystem[index - 1].limit || 0) - 1}
									<tr class="hover">
										<td class="font-semibold">{prevValue}% - {mark.limit}%</td>
										<td class="font-semibold">{mark.name}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="flex items-center gap-2">
						This test is ungraded
						<iconify-icon icon="fluent:info-24-regular" class="text-3xl" />
					</p>
				{/if}
			</div>
		</div>
	</div>
	<Space gap={60} />
	{#if displayRelatedTests === true}
		<h3 class="font-semibold text-h6">You may also like</h3>
		<Separator w={'100%'} h={'1px'} />
		<Space gap={10} />
		{#if relatedTests.length > 0}
			<Carousel data={relatedTests} />
		{:else}
			<Space gap={20} />
			<p class="text-body1">Sorry, nothing to display here</p>
		{/if}
	{/if}
</div>
