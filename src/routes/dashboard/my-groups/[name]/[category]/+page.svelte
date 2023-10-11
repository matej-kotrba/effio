<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { trpc } from '~/lib/trpc/client.js';
	import { transformDate } from '~/lib/utils/date';
	import Space from '~components/separators/Space.svelte';
	import ChatInput from '~components/inputs/ChatInput.svelte';
	import {
		CHAT_INPUT_MAX,
		CHAT_INPUT_MIN,
		chatInputSchema
	} from '~schemas/textInput.js';
	import Drawer from '~components/collapsibles/Drawer.svelte';

	export let data;

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

	$: if (fetchNewMessagesDiv) {
		addIntersection(fetchNewMessagesDiv);
	}

	const categoryId = data.group.groupsSubcategories.find(
		(item) => item.slug === $page.url.pathname.split('/').at(-1)
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

	const subcategory = data.group.groupsSubcategories.find((item) => item.slug);

	if (!subcategory) {
		goto('/dashboard/my-groups/' + data.group.slug);
	}

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

		if (parsedMessage.success === false || subcategory === undefined) return;

		try {
			trpc($page).groupMessages.postMessage.mutate({
				type: 'MESSAGE',
				groupId: data.group.id,
				message: messageContent,
				subcategoryId: subcategory.id
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

		const previousTop = chatContainerRef.scrollTop;
		const previousHeight = chatContainerRef.scrollHeight;

		messages =
			messages === 'fetching'
				? newMessages.reverse()
				: [...newMessages.reverse(), ...messages];
		isFetchingNew = false;
		setTimeout(() => {
			chatContainerRef.scrollTop =
				chatContainerRef.scrollHeight - previousHeight + previousTop;
		}, 0);
	}

	let openDrawer = () => {};

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

		if (categoryId === undefined) {
			goto('/dashboard/my-groups/' + data.group.slug);
		} else {
			const fetchedTests = await trpc(
				$page
			).groups.getSubcategoryTestsById.query({
				id: categoryId
			});

			tests = fetchedTests;

			await getMessages();
		}

		setTimeout(() => {
			scrollToBottom();
			isFetchingNew = false;
		}, 0);
	});
</script>

{#if subcategory}
	<Drawer side="right" bind:open={openDrawer}>
		<div class="flex flex-col gap-2">
			{#each tests as test}
				<div class="flex flex-col overflow-hidden rounded-md shadow-md">
					<button
						type="button"
						class="relative w-full overflow-hidden aspect-video text-body2 group
						before:content-[''] before:z-[1] before:w-full before:h-full before:bg-[#00000045] before:opacity-0
						hover:before:opacity-100 before:absolute before:left-0 before:top-0 before:duration-150"
					>
						<img
							src="/imgs/content_imgs/liska.avif"
							alt="Test"
							class="object-cover w-full h-full duration-200 group-hover:blur-md"
						/>
						<div
							class="z-[2] absolute left-0 w-full h-full p-2 duration-150 -bottom-full
							group-hover:bottom-0 text-white opacity-0 group-hover:opacity-100
							grid place-content-center text-center"
						>
							<p class="line-clamp-3">
								{test.test.description}
							</p>
						</div>
					</button>
					<div
						class="bottom-0 left-0 px-2 py-1 text-center bg-light_secondary text-body2"
					>
						<span
							class="w-full text-light_whiter overflow-ellipsis line-clamp-1"
							><abbr title={test.test.title} class="no-underline"
								>{test.test.title}</abbr
							></span
						>
					</div>
				</div>
			{/each}
		</div>
	</Drawer>
	<div
		class="relative max-h-[calc(100vh-70px)] overflow-scroll px-1"
		bind:this={chatContainerRef}
		on:scroll={(e) => onScroll(e)}
	>
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
		<div class="max-w-[800px] mx-auto">
			<div
				class="fixed w-full max-w-[800px] z-10 bottom-36 flex justify-end pointer-events-none"
			>
				<button
					type="button"
					class="right-0 grid w-10 text-white duration-100 rounded-full shadow-md pointer-events-auto bottom-32 bg-light_terciary aspect-square place-content-center hover:scale-105 {isScrollDownButtonVisible
						? 'opacity-100'
						: ' opacity-0 pointer-events-none'}"
					on:click={() => scrollToBottom(true)}
				>
					<iconify-icon icon="uil:arrow-down" class="text-3xl duration-100" />
				</button>
			</div>
			<ChatInput
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
				{#if messages === 'fetching'}
					<p>Gettig messages</p>
				{:else}
					<div class="flex flex-col gap-8">
						<div bind:this={fetchNewMessagesDiv} class="h-1" />
						{#each messages as message}
							<div>
								<div class="flex items-center gap-1 mb-1">
									<img
										src={message.sender.image}
										alt="User"
										class="w-8 rounded-lg aspect-square"
									/>
									<div class="flex flex-col">
										<span class="text-body2">{message.sender.name}</span>
										<span class="text-body3 text-light_text_black_40">
											{transformDate(message.createdAt, { time: true })}
										</span>
									</div>
								</div>
								<div class="relative p-4 rounded-sm shadow bg-light_whiter">
									{#if message.messageType === 'MESSAGE'}
										<!-- <img
							class="absolute w-10 translate-x-1/2 translate-y-1/2 rounded-full right-full bottom-full aspect-square"
							src={message.sender.image}
							alt="User image"
							/> -->
										{#if message.title}
											<h5 class="text-body1">
												{message.title}
											</h5>
										{/if}
										{#if message.content}
											<p class="text-body2">
												{message.content}
											</p>
										{/if}
										{#if message.testId && message.test}
											<Space gap={10} />
											<div
												class="flex flex-col gap-2 p-2 bg-light_white rounded-md w-fit max-w-[300px] shadow-md group"
											>
												<div>
													<div class="overflow-hidden">
														<img
															src="/imgs/content_imgs/liska.avif"
															alt="{message.test.title} cover"
															class="object-cover w-full duration-150 rounded-sm aspect-video group-hover:scale-110"
															loading="lazy"
														/>
													</div>
													<span>{message.test.title}</span>
												</div>

												<button class="ml-auto btn w-fit">View</button>
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
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.bg-layer {
		background-image: linear-gradient(
			to bottom,
			transparent,
			var(--light-white) 30%
		);
	}
</style>
