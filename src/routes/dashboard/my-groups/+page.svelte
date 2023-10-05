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
	import { superForm } from 'sveltekit-superforms/client';
	import ErrorEnhance from '~components/inputs/ErrorEnhance.svelte';
	import { createGroupSchema } from './schemas';
	import toast from 'svelte-french-toast';

	export let data;

	const { form, errors, enhance, submitting } = superForm(data.form, {
		resetForm: true,
		validators: createGroupSchema
	});

	let imageRef: HTMLImageElement | null = null;

	function onImageUpload(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (imageRef === null || !e.currentTarget.files) return;
		const file = e.currentTarget.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = () => {
			imageRef!.src = reader.result as string;
		};
	}

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
		isSubmitting={$submitting}
	>
		<form
			slot="create"
			method="POST"
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
				<div class="flex flex-col">
					<span
						class="text-body2 text-light_text_black_80 dark:text-dark_text_white_80"
						>Group photo</span
					>
					<div
						class="relative grid duration-100 border-2 border-dashed rounded-md group w-28 border-light_text_black_80 dark:border-dark_text_white_80 aspect-square place-content-center hover:bg-light_white dark:hover:bg-dark_quaternary"
					>
						<input
							type="file"
							on:change={onImageUpload}
							accept="image/jpeg, image/png, image/jpg, image/webp, image/avif"
							class="absolute w-full h-full opacity-0 cursor-pointer"
						/>
						<div
							class="absolute w-full overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-md pointer-events-none aspect-square left-1/2 top-1/2"
						>
							<img
								bind:this={imageRef}
								src=""
								alt="Group icon"
								class="object-cover w-full h-full text-transparent"
							/>
						</div>
						<iconify-icon
							icon="uil:plus"
							class="text-5xl pointer-events-none group-hover:z-10 drop-shadow-md"
						/>
					</div>
				</div>
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
	</UserGroups>
</div>
