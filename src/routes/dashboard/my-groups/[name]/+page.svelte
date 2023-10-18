<script lang="ts">
	import Separator from '~components/separators/Separator.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<div class="p-4">
	{#if data.session?.user?.id === data.group.ownerId}
		<section class="p-2 rounded-md shadow-md bg-light_grey">
			<h4 class="font-semibold text-h4">Admin part</h4>
			<!-- <Separator w="100%" h="1px" /> -->
			<div>
				<a
					href="/dashboard/my-groups/{data.group.slug}/admin-test-overview"
					class="p-2 rounded-md w-[200px] grid place-content-center shadow-md aspect-square bg-light_whiter"
				>
					<h5>Test overview</h5>
				</a>
			</div>
		</section>
	{/if}
</div>
