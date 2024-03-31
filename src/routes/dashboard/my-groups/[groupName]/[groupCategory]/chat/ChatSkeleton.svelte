<script lang="ts">
	import SkeletonLine from '~components/informatic/SkeletonLine.svelte';
	import Space from '~components/separators/Space.svelte';
</script>

<div class="flex items-center gap-2">
	<SkeletonLine class="w-10 h-10 mx-0 rounded-lg" />
	<div class="flex flex-col gap-2">
		<SkeletonLine class="mx-0 h-[1.2rem] w-28" />
		<SkeletonLine class="mx-0 h-[1rem] w-36" />
	</div>
</div>
<SkeletonLine class="w-full h-12 mt-2 rounded-sm" />
<Space gap={36} />
<div class="flex items-center gap-2">
	<SkeletonLine class="w-10 h-10 mx-0 rounded-lg" />
	<div class="flex flex-col gap-2">
		<SkeletonLine class="mx-0 h-[1.2rem] w-20" />
		<SkeletonLine class="mx-0 h-[1rem] w-32" />
	</div>
</div>
<SkeletonLine class="w-full mt-2 rounded-sm h-36" />
<Space gap={36} />
<div class="flex items-center gap-2">
	<SkeletonLine class="w-10 h-10 mx-0 rounded-lg" />
	<div class="flex flex-col gap-2">
		<SkeletonLine class="mx-0 h-[1.2rem] w-32" />
		<SkeletonLine class="mx-0 h-[1rem] w-36" />
	</div>
</div>
<SkeletonLine class="w-full h-12 mt-2 rounded-sm" />
<Space gap={36} />
<div class="flex items-center gap-2">
	<SkeletonLine class="w-10 h-10 mx-0 rounded-lg" />
	<div class="flex flex-col gap-2">
		<SkeletonLine class="mx-0 h-[1.2rem] w-24" />
		<SkeletonLine class="mx-0 h-[1rem] w-32" />
	</div>
</div>
<SkeletonLine class="w-full h-24 mt-2 rounded-sm" />
