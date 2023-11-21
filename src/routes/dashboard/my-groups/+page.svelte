<script lang="ts">
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import TextAreaInput from '~components/inputs/TextAreaInput.svelte';
	import TextInputSimple from '~components/inputs/TextInputSimple.svelte';
	import DashboardTitle from '~components/page-parts/DashboardTitle.svelte';
	import UserGroups from '~components/page-parts/UserGroups.svelte';
	import Space from '~components/separators/Space.svelte';
	import {
		GROUP_DESCRIPTION_MAX,
		GROUP_DESCRIPTION_MIN,
		GROUP_NAME_MAX,
		GROUP_NAME_MIN,
		groupDescriptionSchema,
		groupNameSchema
	} from '~schemas/textInput.js';
	import { joinCodeSchema, JOIN_CODE_LENGTH } from '~schemas/inviteCode';
	import { superForm } from 'sveltekit-superforms/client';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import { createGroupSchema, joinGroupSchema } from './schemas';
	import toast from 'svelte-french-toast';
	import { IMAGE_IMPORT_SIZE_IN_MB } from '~/lib/helpers/constants';
	import ImageImport from '~components/inputs/ImageImport.svelte';

	export let data;

	const { form, errors, enhance, submitting } = superForm(data.form, {
		resetForm: true,
		validators: createGroupSchema
	});

	const {
		form: joinForm,
		errors: joinErrors,
		enhance: joinEnhance,
		submitting: joinSubmitting
	} = superForm(data.joinForm, {
		resetForm: true,
		validators: joinGroupSchema
	});

	let closeCreateDialog: () => void = () => {};
	let closeJoinDialog: () => void = () => {};
</script>

<div class="px-4 pt-6 md:px-8 xl:px-16">
	<DashboardTitle
		title="My Groups"
		subtitle="See all groups you are a member of."
	/>

	<UserGroups
		groups={data.groups ?? []}
		bind:closeDialog={closeCreateDialog}
		bind:closeDialogJoin={closeJoinDialog}
		isSubmitting={$submitting}
	>
		<form
			slot="create"
			method="POST"
			enctype="multipart/form-data"
			use:enhance={{
				onResult: ({ result }) => {
					if (result['status'] === 200) {
						toast.success('Group created successfully!');
						closeCreateDialog();
					} else if (result['type'] === 'failure') {
						console.log(result);
						toast.error(
							result['data'] ? result['data']['error'] : 'Error ocurred'
						);
					}
				}
			}}
			action="?/createGroup"
		>
			<ErrorEnhance error={$errors.name ? $errors.name[0] : undefined}>
				<TextInputSimple
					title="Group name"
					titleName="name"
					max={GROUP_NAME_MAX}
					min={GROUP_NAME_MIN}
					validationSchema={groupNameSchema}
					doesLimit
					bind:inputValue={$form.name}
				/>
			</ErrorEnhance>
			<div class="flex items-start gap-2 h-fit">
				<ImageImport title="Group photo" />
				<div class="w-full">
					<ErrorEnhance
						error={$errors.description ? $errors.description[0] : undefined}
					>
						<TextAreaInput
							title="Group description"
							titleName="description"
							validationSchema={groupDescriptionSchema}
							doesLimit
							min={GROUP_DESCRIPTION_MIN}
							max={GROUP_DESCRIPTION_MAX}
							customStyles={'min-h-[100px] text-body2'}
							inputProperties={{ placeholder: 'Optional' }}
							bind:inputValue={$form.description}
						/>
					</ErrorEnhance>
				</div>
			</div>
			<Space gap={16} />
			<BasicButton
				title={'Create group'}
				isLoading={false}
				class="ml-auto"
				buttonAttributes={{ type: 'submit' }}
			/>
		</form>

		<form
			method="POST"
			slot="join"
			use:joinEnhance={{
				onResult: ({ result }) => {
					if (result['status'] === 200) {
						toast.success('Joined a new group successfully!');
						closeJoinDialog();
					} else if (result['type'] === 'failure') {
						console.log(result);
						toast.error(
							result['data'] ? result['data']['error'] : 'Error ocurred'
						);
					}
				}
			}}
			action="?/joinGroup"
		>
			<ErrorEnhance error={$joinErrors.code ? $joinErrors.code[0] : undefined}>
				<Space gap={16} />
				<TextInputSimple
					title="Enter invite code"
					titleName="code"
					inputProperties={{
						placeholder: 'XXXX-XXXX-XXXX'
					}}
					class="text-center uppercase"
					max={JOIN_CODE_LENGTH}
					min={JOIN_CODE_LENGTH}
					validationSchema={joinCodeSchema}
					doesLimit
					displayOutside
					bind:inputValue={$joinForm.code}
				/>
			</ErrorEnhance>
			<BasicButton
				class="ml-auto"
				buttonAttributes={{
					type: 'submit',
					disabled: !!$joinErrors.code || $joinSubmitting || !$joinForm.code
				}}
				isLoading={$joinSubmitting}
				title="Join"
			/>
		</form>
	</UserGroups>
</div>
