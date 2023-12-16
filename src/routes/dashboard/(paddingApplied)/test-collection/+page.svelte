<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Card from '~components/containers/card/Card.svelte';
	import CardSkeleton from '~components/containers/card/CardSkeleton.svelte';
	import { onMount, setContext } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { TestFullType } from '~/Prisma';
	import { toast } from 'svelte-french-toast';
	import Dialog from '~components/portals/Dialog.svelte';
	import TestCollectionSearch from '~components/page-parts/TestCollectionSearch.svelte';
	import { createExportedFileAndMakeItDownloadable } from '~/utils/testExport';
	import { modalStore } from './modalStore';
	import ScreenCover from '~components/loaders/ScreenCover.svelte';

	export let data;

	let recentTests: { data: TestFullType[]; isLoading: boolean } = {
		data: [],
		isLoading: true
	};

	let isDeletingTest = false;

	let filterTestsFilter: (ids: string[]) => void;

	const modalTabsGenerator = (test: TestFullType) => [
		{
			action: () => {
				goto('test-collection/edit/' + test['id']);
			},
			text: 'Edit',
			iconClass: 'iconamoon:edit-light'
		},
		{
			action: () => {
				const element = document.createElement('a');

				let gift;
				console.log(test);
				try {
					gift = createExportedFileAndMakeItDownloadable(test);
				} catch (e) {
					console.error(e);
					toast.error('Unknown question type');
				}

				if (!gift) return;

				element.setAttribute(
					'href',
					'data:text/plain;charset=utf-8,' + encodeURIComponent(gift)
				);
				element.setAttribute('download', `${test['title']}.txt`);
				element.style.display = 'none';
				document.body.appendChild(element);
				element.click();
				document.body.removeChild(element);
			},
			text: 'Export',
			iconClass: 'mdi:export'
		},
		{
			action: async () => onTestDelete(test.id, test.title),
			text: 'Delete',
			iconClass: 'fluent:delete-28-filled'
		}
	];

	setContext('modalTabsGenerator', modalTabsGenerator);

	function modalDeleteInfoChange(id: string, title: string) {
		$modalStore.modalDeleteInfo.id = id;
		$modalStore.modalDeleteInfo.title = title;
	}

	function onTestDelete(id: string, title: string) {
		modalDeleteInfoChange(id, title);
		$modalStore.openModal();
	}

	async function getRecentTests() {
		if (!data.session?.user?.id) return;
		const res = await trpc($page).getUserTestsById.query({
			limit: 3,
			id: data.session?.user?.id
		});
		recentTests.data = res;
		recentTests.isLoading = false;
	}

	onMount(async () => {
		getRecentTests();
	});
</script>

{#if isDeletingTest}
	<ScreenCover />
{/if}
<Dialog bind:open={$modalStore.openModal}>
	<p class="text-center text-light_text_black dark:text-dark_text_white">
		Are you sure you want to delete test<br /><span class="font-semibold"
			>{$modalStore.modalDeleteInfo?.title || ''}</span
		>
	</p>
	<Space />
	<div class="flex justify-center gap-3">
		<button class="btn">Cancel</button>
		<button
			class="text-white btn btn-error hover:bg-red-600"
			on:click={async () => {
				if ($modalStore.modalDeleteInfo?.id === undefined) return;
				isDeletingTest = true;
				const response = await trpc($page).protected.deleteTest.mutate({
					testGroupId: $modalStore.modalDeleteInfo.id
				});
				isDeletingTest = false;
				console.log(response);
				if (!response['success']) {
					if (response['message']) {
						toast.error(response['message']);
					}
				}
				if (response['success']) {
					getRecentTests();
					//TODO: Intentionally not refetching test collection, becuase if working properly it should not need to refetch
					if (response['test']) filterTestsFilter([response['test']['id']]);
					// recentTests.data = recentTests.data.filter(
					// 	(item) => item.id !== $modalStore.modalDeleteInfo.id
					// );
				}
			}}>Delete</button
		>
	</div>
</Dialog>

<h2
	class="text-h3 font-extralight text-light_text_black dark:text-dark_text_white"
>
	Test Collection
</h2>
<p class="text-body1 text-light_text_black dark:text-dark_text_white_40">
	Here you can see all your tests which you have created
</p>
<Space />
<h3 class="text-h4 text-light_text_black dark:text-dark_text_white">
	Recent activity
</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="grid__container">
	<!-- <div class="w-full max-w-xs p-5 rounded-md shadow-lg aspect-[5/6] bg-light_white">
		<div class="p-5 text-white rounded-md bg-light_text_black_40">
			<Icon icon="ic:round-plus" class="text-6xl" />
		</div>
	</div> -->
	{#if recentTests.isLoading}
		<CardSkeleton />
		<CardSkeleton />
		<CardSkeleton />
	{:else}
		{#each recentTests.data as test}
			<Card
				redirectLink={`/tests/${test.id}`}
				imageLink={test.imageUrl}
				title={test.title}
				description={test.description}
				createdAt={new Date(test.createdAt)}
				stars={test.stars}
				tags={test.tags.map((tag) => tag.tag?.name || '')}
				dropdownTabs={modalTabsGenerator(test)}
			/>
		{/each}
	{/if}
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

<Space />
<h3 class="text-h4 text-light_text_black dark:text-dark_text_white">
	Collection
</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<TestCollectionSearch bind:filterTests={filterTestsFilter} />

<style>
	.grid__container {
		display: grid;
		gap: 12px;
		grid-template-columns: repeat(auto-fill, minmax(150px, 250px));
		place-content: center;
	}
	@media screen and (min-width: 768px) {
		.grid__container {
			place-content: start;
		}
	}
</style>
