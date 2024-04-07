<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { trpc } from '~/lib/trpc/client.js';
	import { transformDate } from '~/lib/utils/date';
	import Space from '~components/separators/Space.svelte';
	import ChatInput from '~components/inputs/ChatInput.svelte';
	import {
		CHAT_INPUT_MAX,
		CHAT_INPUT_MIN,
		chatInputSchema
	} from '~schemas/testValidation.js';
	import Drawer from '~components/collapsibles/Drawer.svelte';
	import TestImageCard from '~components/containers/card/TestImageCard.svelte';
	import { applicationStates } from '~stores/applicationStates';
	import Pusher from 'pusher-js';
	import { PUBLIC_PUSHER_KEY, PUBLIC_PUSHER_CLUSTER } from '$env/static/public';
	import ChatSkeleton from './ChatSkeleton.svelte';
	import { browser } from '$app/environment';

	export let data;

	let pusher: (typeof Pusher)['prototype'];

	let observer: IntersectionObserver;

	function addIntersection(element: HTMLElement) {
		observer.observe(element);

		return {
			destroy() {
				observer.unobserve(element);
			}
		};
	}

	let fetchNewMessagesDiv: HTMLDivElement;

	let isFetchingNew = false;
	let isEndOfChat = false;

	let isFetchingTests = false;

	// For owner of the group to share tests to the chat
	let usersTests: Awaited<
		ReturnType<ReturnType<typeof trpc>['protected']['getTestsOfUser']['query']>
	> = [];

	$: if (fetchNewMessagesDiv) {
		addIntersection(fetchNewMessagesDiv);
	}

	const categoryId = data.group.groupsSubcategories.find(
		(item) => item.slug === $page.params.groupCategory
	)?.id;

	let tests: Awaited<
		ReturnType<
			ReturnType<typeof trpc>['groups']['getSubcategoryTestsById']['query']
		>
	> = [];

	let messages:
		| Awaited<
				ReturnType<
					ReturnType<
						typeof trpc
					>['groups']['getSubcategoryMessagesByGroupSubcategoryId']['query']
				>
		  >
		| 'fetching' = 'fetching';

	let chatRef: HTMLTextAreaElement;

	let chatContainerRef: HTMLDivElement;
	$: chatContainerOffsetTop = browser
		? window.scrollY + chatContainerRef?.getBoundingClientRect().top
		: 0;

	let isScrollDownButtonVisible = false;
	const DISTANCE_TO_APPEAR = 400;

	function setScrollButtonVisible(
		e: UIEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		const distance =
			e.currentTarget.scrollHeight -
			e.currentTarget.scrollTop -
			e.currentTarget.clientHeight;

		isScrollDownButtonVisible = distance >= DISTANCE_TO_APPEAR;
	}

	function submitNewMessage(messageContent: string) {
		if (chatRef === undefined) return;
		const parsedMessage = chatInputSchema.safeParse(messageContent);

		if (parsedMessage.success === false || data.subcategory === undefined)
			return;

		try {
			trpc($page).groupMessages.postMessage.mutate({
				type: 'MESSAGE',
				groupId: data.group.id,
				message: messageContent,
				subcategoryId: data.subcategory.id
			});

			chatRef.value = '';
		} catch (e) {
			console.log(e);
		}
	}

	function onScroll(e: UIEvent & { currentTarget: HTMLDivElement }) {
		setScrollButtonVisible(e);
	}

	function scrollToBottom(smooth?: boolean) {
		if (chatContainerRef === undefined) return;
		chatContainerRef.scrollTo({
			top: chatContainerRef.scrollHeight,
			behavior: smooth ? 'smooth' : 'auto'
		});
	}

	async function getMessages() {
		if (isEndOfChat) return;
		if (isFetchingNew) return;
		if (categoryId === undefined) return;
		isFetchingNew = true;

		const lastMessage =
			messages === 'fetching' ? undefined : messages[0]?.id || undefined;

		const newMessages = await trpc(
			$page
		).groups.getSubcategoryMessagesByGroupSubcategoryId.query({
			id: categoryId,
			cursor: lastMessage,
			take: 4
		});

		if (newMessages.length === 0) {
			isEndOfChat = true;
			isFetchingNew = false;
		}

		const previousTop = chatContainerRef?.scrollTop;
		const previousHeight = chatContainerRef?.scrollHeight;

		messages =
			messages === 'fetching'
				? newMessages.reverse()
				: [...newMessages.reverse(), ...messages];
		isFetchingNew = false;

		await tick();
		if (chatContainerRef) {
			chatContainerRef.scrollTop =
				chatContainerRef.scrollHeight - previousHeight + previousTop;
		}
	}

	async function getUsersTests() {
		isFetchingTests = true;
		usersTests = await trpc($page).protected.getTestsOfUser.query({
			subcategoryId: data.subcategory.id
		});
		isFetchingTests = false;
	}

	onMount(async () => {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(async (entry) => {
					if (entry.isIntersecting) {
						getMessages();
						// observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 1
			}
		);

		if (data.session.user?.id === data.group.ownerId) {
			getUsersTests();
		}

		if (categoryId === undefined) {
			goto('/dashboard/my-groups/' + data.group.slug);
		} else {
			getMessages();

			const fetchedTests = await trpc(
				$page
			).groups.getSubcategoryTestsById.query({
				id: categoryId,
				orderByDate: 'desc'
			});

			tests = fetchedTests;
		}

		isFetchingNew = false;

		pusher = new Pusher(PUBLIC_PUSHER_KEY, {
			cluster: PUBLIC_PUSHER_CLUSTER
		});

		const channel = pusher.subscribe(
			`group-${data.group.id}-${data.subcategory.id}`
		);

		channel.bind('new-message', async (data: any) => {
			try {
				data.createdAt = new Date(data.createdAt);
				data.updatedAt = new Date(data.createdAt);
				messages = [...messages, data];
				await tick();
				scrollToBottom(false);
			} catch {}
		});

		await tick();
		scrollToBottom(false);
	});

	onDestroy(() => {
		observer?.disconnect();
		pusher?.unsubscribe(`group-${data.group.id}-${data.subcategory.id}`);
		pusher?.disconnect();
	});
</script>

<div>
	{#if messages === 'fetching'}
		<div
			class="mx-auto max-w-[800px] mt-4 max-h-[calc(100vh-70px)] overflow-hidden"
		>
			<ChatSkeleton />
		</div>
	{:else}
		<!-- <Drawer
		title={`${data.subcategory.name}'s tests`}
		side="right"
		bind:open={openDrawer}
	>
		<div class="flex flex-col h-full gap-2">
			{#if tests.length === 0}
				<div
					class="absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-content-center left-1/2 top-1/2"
				>
					<iconify-icon
						icon="solar:mask-sad-linear"
						class="grid place-content-center text-8xl text-light_text_black_20 dark:text-dark_text_white_20"
					/>
					<p>No tests here</p>
				</div>
			{:else}
				{#each tests as test}
					<div class="relative">
						{#if data.group.ownerId === data.session.user?.id}
							<a
								href={`/dashboard/my-groups/${data.group.slug}/admin-test-overview/${data.subcategory.slug}/${test.testId}`}
								class="absolute top-0 left-0 z-10 p-1 icon-gradient"
							>
								<iconify-icon
									icon="carbon:result"
									class="text-3xl text-white shadow-sm"
								/>
							</a>
						{/if}
						<TestImageCard
							test={test.test}
							url="/dashboard/my-groups/{data.group.slug}/{data.subcategory
								.slug}/tests/{test.testId}"
						/>
					</div>
				{/each}
			{/if}
		</div>
	</Drawer> -->
		<div
			class="relative flex flex-col justify-between gap-2 px-1 overflow-y-scroll"
			style="max-height: calc(100vh - {chatContainerOffsetTop || 0}px);"
			bind:this={chatContainerRef}
			on:scroll={(e) => onScroll(e)}
		>
			<div>
				{#if isEndOfChat}
					<section class="flex flex-col items-center justify-center mb-4">
						<img
							aria-hidden="true"
							src="/imgs/svgs/welcome.svg"
							class=""
							width="200"
							alt="decorative"
						/>
						<p class="text-light_text_black_80 dark:text-dark_text_white_80">
							This is the start of the <span
								class="font-semibold text-light_text_black dark:text-dark_text_white"
								>{data.group.name}</span
							> channel.
						</p>
					</section>
				{/if}
			</div>
			<div class="max-w-[800px] mx-auto w-full">
				<div
					class="fixed w-full max-w-[800px] z-10 bottom-36 flex justify-end pointer-events-none"
				>
					<button
						type="button"
						class="right-0 grid w-10 text-white duration-100 rounded-full shadow-md pointer-events-auto bottom-32 bg-light_terciary dark:bg-dark_secondary aspect-square place-content-center hover:scale-105 {isScrollDownButtonVisible
							? 'opacity-100'
							: ' opacity-0 pointer-events-none'}"
						on:click={() => scrollToBottom(true)}
					>
						<iconify-icon icon="uil:arrow-down" class="text-3xl duration-100" />
					</button>
				</div>
				<ChatInput
					on:testSubmit={() => {
						getUsersTests();
					}}
					groupId={data.group.id}
					subcategoryId={data.subcategory.id}
					{isFetchingTests}
					tests={usersTests.map((test) => {
						return {
							title: test.title,
							testId: test.id,
							isAdded: test.subcategories.length > 0,
							subcategoryOnTestId: test.subcategories[0]?.id || undefined
						};
					})}
					class="bottom-8 max-w-[800px]"
					limit={{
						min: CHAT_INPUT_MIN,
						max: CHAT_INPUT_MAX
					}}
					bind:textAreaRef={chatRef}
					on:chatSubmit={(e) => {
						submitNewMessage(e.detail);
					}}
				/>
				<!-- Backgroud layer to hide chat -->
				<div class="fixed bottom-0 left-0 w-full h-32 z-[8] bg-layer" />
				<div class="mb-32">
					<div class="flex flex-col gap-8">
						{#if isEndOfChat === false}
							<div class="flex justify-center">
								<span class="loading loading-bars loading-lg" />
							</div>
						{/if}
						<div bind:this={fetchNewMessagesDiv} class="h-1" />
						{#each messages as message}
							<div>
								<div class="flex items-center gap-1 mb-1">
									<img
										referrerpolicy="no-referrer"
										src={message.sender.image}
										alt="User"
										class="w-10 rounded-lg aspect-square"
									/>
									<div class="flex flex-col">
										<span class="text-semiBody1">{message.sender.name}</span>
										<span
											class="text-body2 text-light_text_black_40 dark:text-dark_text_white_40"
										>
											{transformDate(message.createdAt, { time: true })}
										</span>
									</div>
								</div>
								<div
									class="relative p-4 rounded-sm shadow bg-light_whiter dark:bg-dark_quaternary"
								>
									{#if message.messageType === 'MESSAGE'}
										{#if message.title}
											<h5 class="text-body1">
												{message.title}
											</h5>
										{/if}
										{#if message.content}
											<p class="break-words text-body2">
												{message.content}
											</p>
										{/if}
										{#if message.testId && message.test}
											<Space gap={10} />
											<div
												class="flex flex-col gap-2 p-2 bg-light_white dark:bg-dark_terciary rounded-md w-fit max-w-[300px] shadow-md group"
											>
												<div>
													<div class="overflow-hidden">
														<img
															src={message.test?.imageUrl
																? message.test.imageUrl
																: $applicationStates['darkMode']['isDarkMode']
																? '/imgs/content_imgs/poly_dark.png'
																: '/imgs/content_imgs/poly.png'}
															alt="{message.test.title} cover"
															class="object-cover w-full duration-150 rounded-sm aspect-video group-hover:scale-110"
															loading="lazy"
														/>
													</div>
													<span>{message.test.title}</span>
												</div>

												<a
													href="/dashboard/my-groups/{data.group.slug}/{data
														.subcategory.slug}/tests/{message.testId}"
													class="ml-auto btn w-fit dark:bg-dark_light_grey dark:text-dark_text_white dark:outline-dark_light_grey"
													>View</a
												>
											</div>
										{:else if message.testId}
											<div>Oops, this test can't be accessed anymore.</div>
										{/if}
									{:else if message.messageType === 'TEST'}
										TEST
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.bg-layer {
		background-image: linear-gradient(
			to bottom,
			transparent,
			var(--light-white) 30%
		);
	}
	:global(.dark) .bg-layer {
		background-image: linear-gradient(
			to bottom,
			transparent,
			var(--dark_black) 30%
		);
	}
</style>
