<script lang="ts">
	import IconButtonExpandable from '~components/buttons/IconButtonExpandable.svelte';
	import { AUTHENTICATED_NAV_HEIGHT } from '../../+layout.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { titleSchema } from '~schemas/testValidation';
	import { DB_STRING_MESSAGE, DB_STRING_REGEX } from '~helpers/constants';

	let scrollFromTop = 0;

	$: asideLimit =
		scrollFromTop >= AUTHENTICATED_NAV_HEIGHT
			? 0
			: AUTHENTICATED_NAV_HEIGHT - scrollFromTop;

	export let data;

	let newChannelDialog: HTMLDialogElement;

	let openNewChannelDialog: () => void;
</script>

<svelte:window bind:scrollY={scrollFromTop} />
<Dialog
	bind:modal={newChannelDialog}
	bind:open={openNewChannelDialog}
	title="New channel"
>
	<form action="">
		<TextInputSimple
			title="Channel name"
			titleName="channelname"
			inputProperties={{ placeholder: 'Program a function...' }}
			validationSchema={titleSchema}
			validator={{ query: DB_STRING_REGEX, message: DB_STRING_MESSAGE }}
			displayOutside={true}
		/>
		<!-- on:error={(event) =>
				($testObject.questions[INDEX_OF_QUESTION]['errors']['title'] =
					event.detail)}
			bind:inputValue={$testObject.questions[INDEX_OF_QUESTION]['title']} -->
	</form>
</Dialog>
<div class="relative h-full grid__container">
	<aside
		class="sticky top-0 left-0 p-2 overflow-y-auto"
		style={`max-height: calc(100vh - ${asideLimit}px); min-height: calc(100vh - ${asideLimit}px);`}
	>
		<div
			class="flex flex-col items-center w-full h-full gap-2 py-2 border border-solid rounded-md dark:bg-dark_grey bg-light_whiter border-light_text_black_10 dark:border-dark_text_white_10"
		>
			<a href="/dashboard/my-groups/{data.group.slug}">
				<IconButtonExpandable shouldExpand={true} fullText={'Home'}>
					<iconify-icon icon="ion:home" class="text-2xl" slot="title" />
				</IconButtonExpandable>
			</a>
			{#each data.group['groupsSubcategories'] as category}
				<a href="/dashboard/my-groups/{data.group.slug}/{category.slug}">
					<IconButtonExpandable shouldExpand={true} fullText={category.name}>
						<span slot="title">{category.name.substring(0, 3)}</span>
					</IconButtonExpandable>
				</a>
			{/each}
			<IconButtonExpandable
				onClick={openNewChannelDialog}
				shouldExpand={false}
				fullText={''}
				containerClasses="mt-auto"
			>
				<iconify-icon slot="title" icon="uil:plus" class="text-3xl" />
			</IconButtonExpandable>
		</div>
	</aside>
	<!-- <div class="relative w-full">
		<ul
			class="w-full max-h-full min-h-full py-8 border-r-2 border-solid menu border-light_text_black_20 dark:border-dark_text_white_20 sidebar"
		>
			<li class="w-full mb-1 font-semibold text-body1">
				<a
					href="/dashboard/my-groups/{data.group.slug}"
					class="relative w-full dark:hover:bg-dark_text_white_20 dark:hover:text-dark_text_white"
					class:active={$page.url.pathname.split('/').at(-1) ===
						data.group.slug}
				>
					<iconify-icon icon="ion:home" class="text-2xl" />
					<span
						class="inline-block w-[170px] py-1 whitespace-nowrap overflow-hidden text-ellipsis text-left"
					>
						{data.group.name}
					</span>
				</a>
			</li>
			{#each data.group['groupsSubcategories'] as category}
				<li>
					<a
						href="/dashboard/my-groups/{data.group.slug}/{category.slug}"
						class="dark:hover:bg-dark_text_white_20 dark:hover:text-dark_text_white"
						class:active={$page.url.pathname.split('/').at(-1) ===
							category.slug}
					>
						{category.name}
					</a>
				</li>
			{/each}
		</ul>
	</div> -->
	<div>
		<slot />
	</div>
</div>

<style>
	.grid__container {
		display: grid;
		grid-template-columns: 5rem 1fr;
	}
	.active {
		@apply bg-light_secondary text-white;
	}
	:global(.dark) .active {
		@apply bg-dark_secondary;
	}
</style>
