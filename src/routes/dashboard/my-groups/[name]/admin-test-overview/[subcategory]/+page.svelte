<script lang="ts">
	import TestImageCard from '~components/containers/card/TestImageCard.svelte';

	export let data;
</script>

<!-- <div class="grid w-full grid-cols-2 gap-1">
								{#each testArray as testInitial}
									<div class="relative">
										<div
											class="flex gap-1 p-1 items-center absolute right-2 top-2 shadow-sm dark:shadow-white bg-light_quaternary text-light_text_black dark:bg-dark_quaternary dark:text-dark_text_white z-[5] w-fit whitespace-nowrap rounded-lg"
										>
											<span class="text-body3">Taken by:</span>
											<span class="text-body2"
												>{testInitial.takenByPeopleCount}</span
											>
										</div>
										<TestImageCard
											test={{
												title: testInitial.title,
												description: 'See the statistics'
											}}
											url={`/dashboard/my-groups/${data['group']['slug']}/admin-test-overview/${subcategory.slug}/${testInitial.id}`}
										/>
									</div>
								{/each}
							</div> -->
