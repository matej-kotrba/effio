<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { HTMLDivAttributes } from 'bits-ui/dist/internal';
	import { twMerge } from 'tailwind-merge';

	type $$Props = HTMLDivAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };

	const allowedLinkSymbol = ':*:';
	const allowedLinks: string[] = [];

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
			// console.log(tokenPath);
			// console.log(menu.map((item) => item.link).includes(tokenPath));
			return { label: t, href: tokenPath };
		});

		// Add a way to get home too.
		crumbs.unshift({ label: 'Home', href: '/' });
	}

	// Uses * as wildcards for dynamic path segments
	function generateAllowedLink(link: string): void {
		let al = link;
		while (al.includes('[') && al.includes(']')) {
			let startIndex = al.indexOf('[');
			let endIndex = al.indexOf(']');
			al =
				al.substring(0, startIndex - 1) +
				`/${allowedLinkSymbol}` +
				al.substring(endIndex + 1, al.length);
		}
		allowedLinks.push(al);
	}

	function checkLinkValidity(link: string): boolean {
		// Nejspíše bude nutná rekurze, budou se muset procházet veškeré přístupné cesty,
		// ty poté budou muset procházet a dokazovat že splňují podmínky, pokud žádná
		// podmínky nesplní tak je cesta zakázaná a nebude zobrazena
	}

	onMount(() => {
		for (let path in modules) {
			let pathSanitized = path.replace('.svelte', '').replace('./', '/');

			// for group layouts
			if (pathSanitized.includes('/(')) {
				pathSanitized = pathSanitized.substring(
					pathSanitized.indexOf(')/') + 1
				);
			}

			pathSanitized = pathSanitized.replace('/+page', '');

			generateAllowedLink(pathSanitized);

			// for dynamic paths -> needs more triaging
			if (pathSanitized.includes('[')) {
				pathSanitized = pathSanitized.replaceAll('[', '').replaceAll(']', '');
			}

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
