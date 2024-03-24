<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { HTMLDivAttributes } from 'bits-ui/dist/internal';
	import { twMerge } from 'tailwind-merge';

	type $$Props = HTMLDivAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };

	const modules: Record<string, () => unknown> = import.meta.glob(
		'/**/+page.svelte',
		{ eager: true }
	);
	let menu: Array<{ link: string; title: string }> = [];
	let crumbs: Array<{ label: string; href: string }> = [];

	$: pathname = $page.url.pathname;

	$: {
		// Remove zero-length tokens.
		const tokens = pathname.split('/').filter((t) => t !== '');

		// Create { label, href } pairs for each token.
		let tokenPath = '';
		crumbs = tokens.map((t) => {
			tokenPath += '/' + t;
			t = t.charAt(0).toUpperCase() + t.slice(1);
			t = t.replace('-', ' ');
			return { label: t, href: tokenPath };
		});

		// Add a way to get home too.
		crumbs.unshift({ label: 'Home', href: '/' });
	}

	$: console.log(modules);

	onMount(() => {
		for (let path in modules) {
			let pathSanitized = path.replace('.svelte', '').replace('./', '/');

			// for group layouts
			if (pathSanitized.includes('/(')) {
				pathSanitized = pathSanitized.substring(
					pathSanitized.indexOf(')/') + 1
				);
			}

			// for dynamic paths -> needs more triaging
			if (pathSanitized.includes('[')) {
				pathSanitized = pathSanitized.replaceAll('[', '').replaceAll(']', '');
			}

			pathSanitized = pathSanitized.replace('/+page', '');

			menu = [
				...menu,
				{
					title: pathSanitized
						? pathSanitized.substring(pathSanitized.lastIndexOf('/') + 1)
						: 'home',
					link: pathSanitized ? pathSanitized : '/'
				}
			];
		}
	});
</script>

<div {...$$props} class={twMerge('text-sm breadcrumbs', className)}>
	<ul>
		{#each crumbs as crumb}
			<li>
				<a href={crumb.href}>
					{crumb.label}
				</a>
			</li>
		{/each}
	</ul>
</div>
