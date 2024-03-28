<script lang="ts">
	import IconButtonExpandable from '~components/buttons/IconButtonExpandable.svelte';
	import { AUTHENTICATED_NAV_HEIGHT } from '../../+layout.svelte';
	import Dialog from '~components/portals/Dialog.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import { channelNameSchema, titleSchema } from '~schemas/testValidation';
	import { channelCreateSchema } from '../schemas';
	import { DB_STRING_MESSAGE, DB_STRING_REGEX } from '~helpers/constants';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import toast from 'svelte-french-toast';
	import TypeRadioGroup, {
		type Choice
	} from '~components/inputs/TypeRadioGroup.svelte';
	import { GROUP_SUBCATEGORY_TYPES } from '~helpers/constants';

	let scrollFromTop = 0;

	$: asideLimit =
		scrollFromTop >= AUTHENTICATED_NAV_HEIGHT
			? 0
			: AUTHENTICATED_NAV_HEIGHT - scrollFromTop;

	export let data;

	let newChannelDialog: HTMLDialogElement;
	const newChannelChoices: Choice[] = [
		{
			icon: 'material-symbols:chat',
			title: 'Chat',
			value: GROUP_SUBCATEGORY_TYPES.CHAT,
			description:
				'Channel open for everyone to chat, owner can share files and tests'
		},
		{
			icon: 'mdi:announcement',
			title: 'Announcement',
			value: GROUP_SUBCATEGORY_TYPES.ANNOUCEMENT,
			description: 'Channel for announcements, only owner can post here'
		}
	];

	let openNewChannelDialog: () => void;
	let closeNewChannelDialog: () => void;

	const {
		form: formCreate,
		errors: errorsCreate,
		enhance: enhanceCreate,
		submitting: submittingCreate
	} = superForm(data.createChannelForm, {
		resetForm: true,
		validators: channelCreateSchema
	});
</script>

<svelte:window bind:scrollY={scrollFromTop} />
<Dialog
	bind:modal={newChannelDialog}
	bind:open={openNewChannelDialog}
	bind:close={closeNewChannelDialog}
	title="New channel"
>
	<form
		method="POST"
		action="?/createChannel"
		use:enhanceCreate={{
			onResult: ({ result }) => {
				if (result['status'] === 200) {
					toast.success('Group created successfully!');
					closeNewChannelDialog();
				} else if (result['type'] === 'failure') {
					console.log(result);
					toast.error(
						result['data'] ? result['data']['error'] : 'Error ocurred'
					);
				}
			}
		}}
	>
		<input type="hidden" name="id" value={data.group.id} />
		<TypeRadioGroup
			choices={newChannelChoices}
			inputGroupName={'newChannelType'}
			class="my-2"
			bind:selectedRadio={$formCreate.newChannelType}
		/>
		<ErrorEnhance
			error={$errorsCreate.name ? $errorsCreate.name[0] : undefined}
		>
			<TextInputSimple
				title="Channel name"
				titleName="name"
				inputProperties={{ placeholder: 'Channel name...' }}
				validationSchema={channelNameSchema}
				validator={{ query: DB_STRING_REGEX, message: DB_STRING_MESSAGE }}
				displayOutside={true}
				bind:inputValue={$formCreate.name}
			/>
		</ErrorEnhance>
		<!-- on:error={(event) =>
				($testObject.questions[INDEX_OF_QUESTION]['errors']['title'] =
					event.detail)}
			bind:inputValue={$testObject.questions[INDEX_OF_QUESTION]['title']} -->
	</form>
</Dialog>
<div class="relative h-full grid__container">
	<aside
		class="sticky top-0 left-0 p-2 z-[1000]"
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
