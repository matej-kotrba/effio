<script lang="ts">
	import { trpc } from '~/lib/trpc/client';
	import Space from '~components/separators/Space.svelte';
	import Separator from '~components/separators/Separator.svelte';
	import Card from '~components/containers/card/Card.svelte';
	import CardSkeleton from '~components/containers/card/CardSkeleton.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { TestFullType } from '~/Prisma';
	import { generateGIFT, type GIFTQuestion } from 'gift-format-generator';
	import { toast } from 'svelte-french-toast';
	import Dialog from '~components/portals/Dialog.svelte';

	export let data;

	let recentTests: { data: TestFullType[]; isLoading: boolean } = {
		data: [],
		isLoading: true
	};

	let openModal: () => void;
	let modalDeleteInfo: {
		id?: string;
		title?: string;
	} = {};

	onMount(async () => {
		if (!data.session?.user?.id) return;
		const res = await trpc($page).getUserTestsById.query({
			limit: 3,
			id: data.session?.user?.id
		});
		recentTests.data = res;
		recentTests.isLoading = false;
	});

	function createExportedFileAndMakeItDownloadable(test: TestFullType) {
		return generateGIFT(
			test.testVersions[0]['questions'].map((question) => {
				let questionType;
				let content: GIFTQuestion['answers'];
				console.log(question);

				switch (question['type']['slug'] as keyof QuestionTypeMap) {
					case 'pickOne': {
						questionType = 'SC' as const;

						const questionContent = question['content'] as PickOneQuestion;
						content = questionContent.answers.map((answer, index) => {
							return {
								text: answer.answer,
								isCorrect: index === questionContent.correctAnswerIndex
							};
						});
						break;
					}
					case 'true/false': {
						questionType = 'MC' as const;

						const questionContent = question['content'] as TrueFalseQuestion;
						content = questionContent.answers.map((answer) => {
							return {
								text: answer.answer,
								isCorrect: answer.isTrue
							};
						});
						break;
					}
					default: {
						throw new Error('Unknown question type');
					}
				}

				return {
					title: question.title,
					questionName: question.title,
					formatter: 'plain',
					type: questionType,
					answers: content
				};
			})
		);
	}
</script>

<Dialog bind:open={openModal}>
	<p class="text-center text-light_text_black">
		Are you sure you want to delete test<br /><span class="font-semibold"
			>{modalDeleteInfo?.title || ''}</span
		>
	</p>
	<Space />
	<div class="flex justify-center gap-3">
		<button class="btn">Cancel</button>
		<button
			class="text-white btn btn-error hover:bg-red-600"
			on:click={async () => {
				if (modalDeleteInfo?.id === undefined) return;
				const response = await trpc($page).protected.deleteTest.mutate({
					testGroupId: modalDeleteInfo.id
				});
				console.log(response);
				if (!response['success']) {
					if (response['message']) {
						toast.error(response['message']);
					}
				}
				if (response['success']) {
					recentTests.data = recentTests.data.filter(
						(item) => item.id !== modalDeleteInfo.id
					);
				}
			}}>Delete</button
		>
	</div>
</Dialog>

<h2 class="text-h3 font-extralight text-light_text_black">Test Collection</h2>
<p class="text-body1 text-light_text_black_40">
	Here you can see all your tests which you have created
</p>
<Space />
<h3 class="text-h4 text-light_text_black">Recent activity</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
<div class="flex items-center gap-4">
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
				title={test.testVersions[0].title}
				description={test.testVersions[0].description}
				createdAt={new Date(test.createdAt)}
				stars={test.stars}
				tags={test.tags.map((tag) => tag.name)}
				dropdownTabs={[
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
							element.setAttribute(
								'download',
								`${test['testVersions'][0]['title']}.txt`
							);
							element.style.display = 'none';
							document.body.appendChild(element);
							element.click();
							document.body.removeChild(element);
						},
						text: 'Export',
						iconClass: 'mdi:export'
					},
					{
						action: async () => {
							modalDeleteInfo.id = test.id;
							modalDeleteInfo.title = test.testVersions[0].title;
							openModal();
						},
						text: 'Delete',
						iconClass: 'fluent:delete-28-filled'
					}
				]}
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
<h3 class="text-h4 text-light_text_black">Collection</h3>
<Separator w={'100%'} h={'1px'} color={'var(--light-text-black-20)'} />
<Space />
