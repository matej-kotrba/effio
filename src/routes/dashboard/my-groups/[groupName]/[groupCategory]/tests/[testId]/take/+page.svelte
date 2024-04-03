<script lang="ts">
	import TestTake from '~components/testTaking/TestTake.svelte';
	import Back from '~components/navigation/Back.svelte';
	import Space from '~components/separators/Space.svelte';
	import BasicButton from '~components/buttons/BasicButton.svelte';
	import { trpc } from '~/lib/trpc/client';
	import { page } from '$app/stores';
	import { createTRPCErrorNotification } from '~utils/notification';
	import { TRPCClientError } from '@trpc/client';
	import toast from 'svelte-french-toast';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/stores';

	export let data;

	let isCreatingAttempt = false;
	let hasCreatedAttempt = false;

	async function createAttempt() {
		if (isCreatingAttempt === true) return;
		isCreatingAttempt = true;
		try {
			const result = await trpc($page).protected.createTestAttempt.mutate({
				subcategoryId: data.subcategory.id,
				testId: data.testContent.id
			});
			if (result.success) {
				hasCreatedAttempt = true;
			}
		} catch (e) {
			console.log(e);
			if (e instanceof TRPCClientError) {
				createTRPCErrorNotification(e);
			} else {
				toast.error('An error occured while creating an attempt');
			}
		} finally {
			isCreatingAttempt = false;
		}
	}
</script>

<Space gap={10} />
<Back
	class="ml-2"
	link={`/dashboard/my-groups/${data.group.slug}/${data.subcategory.slug}/`}
/>

{#if data.testContent.ownerId !== data.session.user?.id && hasCreatedAttempt === false && data.numberOfTriesCount !== null && data.numberOfTriesCount >= 0 && data.testContent.subcategories[0].numberOfTries !== null}
	<div
		class="grid place-content-center"
		out:fade={{ duration: $navigating === null ? 200 : 0 }}
	>
		{#if data.numberOfTriesCount < data.testContent.subcategories[0].numberOfTries}
			<p class="text-h5">You are about to take attempt limited test!</p>
			<p>
				Number of tries left: <span class="font-semibold text-h5"
					>{data.testContent.subcategories[0].numberOfTries -
						data.numberOfTriesCount}</span
				>
			</p>
			<Space gap={16} />
			<p
				class="text-body2 text-light_text_black_60 dark:text-dark_text_white_60"
			>
				* Clicking the button uses an attempt immedietly
			</p>
			<BasicButton
				title={'Start test'}
				isLoading={isCreatingAttempt}
				onClick={createAttempt}
				buttonAttributes={{ disabled: isCreatingAttempt }}
			/>
		{:else}
			<p>
				Sorry, you have already used all your attempts and therefore cannot take
				this test again
			</p>
		{/if}
	</div>
{:else}
	<div class="p-2" in:fade={{ duration: 200, delay: 200 }}>
		<TestTake
			subcategoryId={data.subcategory.id}
			session={data.session}
			testContent={data.testContent}
		/>
	</div>
{/if}
