<script lang="ts">
	import { initializeTestToTestStore } from '~helpers/test/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[testId]/+page.svelte';
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
	import * as Tooltip from '~components/ui/tooltip';

	type TestContentRaw = NonNullable<
		Awaited<ReturnType<ReturnType<typeof trpc>['getTestById']['query']>>
	>;

	export let testContent: ExcludePick<TestContentRaw, 'subcategories'>;
	export let subcategoryConnection:
		| TestContentRaw['subcategories'][number]
		| undefined = undefined;
	export let numberOfUserTries: number | undefined = undefined;

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
	let isStarred = testContent.stars?.length > 0;

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
	<div class="flex items-center justify-between">
		<h3 class="text-h3 font-extralight">Test overview</h3>
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
		</div>
	</div>
	<div class="grid gap-4 md:grid-cols-2">
		<div>
			<h4 class="font-semibold">General Info</h4>
			<div
				class="p-2 border rounded-md bg-light_whiter dark:bg-dark_grey border-light_text_black_20 dark:border-dark_text_white_20"
			>
				<div class="flex flex-wrap justify-between">
					<h5 class="text-h5">{testContent.title}</h5>
					<Tooltip.Root openDelay={300}>
						<Tooltip.Trigger>
							<div>
								<img
									src={testContent.owner.image}
									class="w-8 border rounded-full border-light_text_black_20 dark:border-dark_text_white_20"
									alt="Author"
								/>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<span>Author: {testContent.owner.name}</span>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
				<p
					class="text-light_text_black_80 dark:text-dark_text_white_60 text-semiBody1 line-clamp-3"
				>
					{testContent.description}
				</p>
				<Space gap={24} />

				<div>
					<div class="flex items-center gap-2">
						<span> Test type: </span>
						<span class="font-semibold"
							>{testContent.type === 'REGULAR'
								? 'Quiz'
								: testContent.type === 'PROGRAMMING'
								? 'Programming'
								: ''}</span
						>
					</div>
					{#if testContent.type !== 'PROGRAMMING'}
						<div class="flex items-center gap-2">
							<span> Is randomly shuffled </span>
							<iconify-icon
								icon={isRandomShuffled ? 'charm:tick' : 'ic:round-close'}
								class={`text-3xl grid place-content-center ${
									isRandomShuffled
										? 'text-success'
										: 'text-error dark:text-dark_error'
								}`}
							/>
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<span> Is anonymous: </span>
						<iconify-icon
							icon={subcategoryConnection ? 'ic:round-close' : 'charm:tick'}
							class={`text-3xl grid place-content-center ${
								subcategoryConnection
									? 'text-error dark:text-dark_error'
									: 'text-success'
							}`}
						/>
					</div>
				</div>
				{#if subcategoryConnection && subcategoryConnection.numberOfTries !== undefined && subcategoryConnection.numberOfTries !== null && numberOfUserTries !== undefined}
					<div class="mt-2">
						<p>This test has limited number of attempts!</p>
						<p>
							You have <span class="font-semibold text-h4"
								>{subcategoryConnection.numberOfTries - numberOfUserTries}</span
							><span
								class="text-light_text_black_80 dark:text-dark_text_white_80"
								>/</span
							><span>{subcategoryConnection.numberOfTries}</span>
							left
						</p>
					</div>
				{/if}
				{#if testContent.tags.length > 0}
					<div>
						<span
							class="font-light text-light_text_black_80 dark:text-dark_text_white_80"
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
			<h4 class="font-semibold">Marking</h4>
			<div
				class="flex items-center gap-1 p-2 border rounded-md bg-light_whiter dark:bg-dark_grey border-light_text_black_20 dark:border-dark_text_white_20"
			>
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
									<tr class="hover dark:hover:!bg-dark_light_grey">
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
			<h4 class="font-semibold">Previous attempts</h4>
			<div
				class="p-2 border rounded-md bg-light_whiter dark:bg-dark_grey border-light_text_black_20 dark:border-dark_text_white_20"
			>
				<div class="w-full overflow-x-auto">
					<table class="table text-body2">
						<!-- head -->
						<thead>
							<tr class="text-light_text_black_80 dark:text-dark_text_white_80">
								<th class="text-body1">Percentage %</th>
								<th class="text-body1">Mark</th>
							</tr>
						</thead>
						<tbody>
							<!-- {#each testContent[''] as record}{/each} -->
						</tbody>
					</table>
				</div>
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
