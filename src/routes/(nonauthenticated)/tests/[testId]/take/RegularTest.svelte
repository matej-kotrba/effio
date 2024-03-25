<script lang="ts">
	import type { Session } from '@auth/core/types';
	import TestTake, {
		type TestContent
	} from '~components/testTaking/TestTake.svelte';

	export let data: TestContent;
	export let session: Session | null;
</script>

<TestTake testContent={data} {session} />
