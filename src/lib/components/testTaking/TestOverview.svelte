<script lang="ts">
	import { initializeTestToTestStore } from '~helpers/test';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import { goto } from '$app/navigation';
	import { checkMarkSystem } from '~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte';
	import MarkSystemDropdown from '~components/collapsibles/markSystem/markSystemDropdown.svelte';
	import type { Prisma } from '@prisma/client';

	export let testContent: Prisma.TestGetPayload<{
		include: {
			testVersions: {
				include: {
					questions: {
						include: {
							type: true;
						};
					};
				};
			};
			owner: true;
		};
	}>;

	export let testLink: string;

	initializeTestToTestStore(testContent);

	let markSystem: MarkSystemJSON['marks'] | null = checkMarkSystem(
		testContent.testVersions[0].markSystemJSON
	);
</script>

<div class="max-w-[1200px] mx-auto p-3 rounded-md">
	<h3 class="text-h3 font-extralight">Test overview</h3>
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
	</div>
	<p class="flex items-center gap-1">
		{#if markSystem}
			<MarkSystemDropdown {markSystem} />
		{:else}
			<p class="flex items-center gap-2">
				This test is ungraded
				<iconify-icon icon="fluent:info-24-regular" class="text-3xl" />
			</p>
		{/if}
	</p>
	<Space gap={30} />
	<a href={testLink}>
		<BasicButton title="Take test" />
	</a>
</div>
