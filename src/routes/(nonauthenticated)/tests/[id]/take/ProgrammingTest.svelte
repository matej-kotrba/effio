<script lang="ts">
	import type { Prisma, TestRecord } from '@prisma/client';
	import { handwrite } from '~use/handwrite';

	export let data: {
		testContent: Prisma.TestGetPayload<{
			include: {
				testVersions: {
					include: {
						questions: {
							include: {
								type: true;
							};
						};
					};
				};
				owner: true;
			};
		}>;
	};
	export let submitError: string;
	export let isSubmitting: boolean;
	export let openDialog: () => void;
	export let result: QuestionServerCheckResponse<QuestionContent>[] | null;
	export let returnedTestRecord:
		| (TestRecord &
				Prisma.TestRecordGetPayload<{
					include: {
						questionRecords: true;
					};
				}>)
		| undefined = undefined;
</script>

<h2 class="font-semibold text-h3" use:handwrite>{data.testContent.title}</h2>
