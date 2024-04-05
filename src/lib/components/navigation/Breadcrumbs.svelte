<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { HTMLDivAttributes } from 'bits-ui/dist/internal';
	import { twMerge } from 'tailwind-merge';

	type $$Props = HTMLDivAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };

	const allowedLinkSymbol = ':*:';
	let allowedLinks: string[] = [];

	const dynamicReplaces: Record<`[${string}]`, string> = {
		'[testId]': 'Test',
		'[groupName]': 'Group',
		'[groupCategory]': 'Channel',
		'[test]': 'Test',
		'[subcategory]': 'Channel',
		'[userId]': 'User'
	};

	const modules: Record<string, () => unknown> = import.meta.glob(
		'/**/+page.svelte',
		{ eager: true }
	);
	let menu: Array<{
		link: string;
		title: string;
		dynamiclyEditedPath: Record<number, string>;
	}> = [];
	let crumbs: Array<
		| {
				label: string;
				href: string;
		  }
		| undefined
	> = [];

	$: pathname = $page.url.pathname;

	// $: console.log(menu);

	$: {
		// Remove zero-length tokens.
		const tokens = pathname.split('/').filter((t) => t !== '');

		let tokenPath = '';
		crumbs = tokens.map((t) => {
			// Finding if there is any dynamic segment
			tokenPath += '/' + t;
			t = t.charAt(0).toUpperCase() + t.slice(1);
			t = t.replace('-', ' ');
			if (!checkLinkValidity(tokenPath, allowedLinks)) {
				return undefined;
			}

			return { label: t, href: tokenPath };
		});

		const splittedPath = tokenPath.split('/');
		const temp = menu.find((item) => {
			const itemSplit = item.link.split('/');
			for (let i = 0; i < splittedPath.length; i++) {
				if (itemSplit[i] === allowedLinkSymbol) continue;
				if (itemSplit[i] !== splittedPath[i]) return false;
			}
			return true;
		});

		// Create { label, href } pairs for each token.
		tokenPath = '';
		const tempKeys = Object.keys(temp?.dynamiclyEditedPath || {});
		crumbs = tokens.map((t, index) => {
			// Finding if there is any dynamic segment
			tokenPath += '/' + t;
			t = t.charAt(0).toUpperCase() + t.slice(1);
			t = t.replaceAll('-', ' ');
			if (!checkLinkValidity(tokenPath, allowedLinks)) {
				return undefined;
			}
			let customLabel = '';
			if (temp && tempKeys.includes((index + 1).toString())) {
				customLabel = temp.dynamiclyEditedPath[index + 1];
			}

			return { label: customLabel || t, href: tokenPath };
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
		al = al.replace('/src/routes', '');

		allowedLinks = [...allowedLinks, al];
	}

	function checkLinkValidity(link: string, validLinks: string[]): boolean {
		let linkSplit = link.split('/');
		return validLinks.some((al) => {
			let alSplit = al.split('/');
			if (alSplit.length !== linkSplit.length) return false;
			for (let i = 0; i < alSplit.length; i++) {
				if (alSplit[i] === allowedLinkSymbol) continue;
				if (alSplit[i] !== linkSplit[i]) return false;
			}
			return true;
		});
	}

	onMount(() => {
		for (let path in modules) {
			let pathSanitized = path.replace('.svelte', '').replace('./', '/');

			while (pathSanitized.includes('/(') && pathSanitized.includes(')')) {
				pathSanitized =
					pathSanitized.substring(0, pathSanitized.indexOf('/(')) +
					pathSanitized.substring(pathSanitized.indexOf(')') + 1);
			}

			pathSanitized = pathSanitized.replace('/+page', '');

			generateAllowedLink(pathSanitized);

			pathSanitized = pathSanitized.replace('/src/routes', '');
			const dynamiclyEditedPaths: (typeof menu)[number]['dynamiclyEditedPath'] =
				{};

			// for dynamic paths -> needs more triaging
			const segments = pathSanitized.split('/');

			for (let i = 0; i < segments.length; i++) {
				if (
					segments[i][0] === '[' &&
					segments[i][segments[i].length - 1] === ']'
				) {
					dynamiclyEditedPaths[i] =
						dynamicReplaces[segments[i] as `[${string}]`];
				}
			}

			while (pathSanitized.includes('[') && pathSanitized.includes(']')) {
				let startIndex = pathSanitized.indexOf('[');
				let endIndex = pathSanitized.indexOf(']');
				pathSanitized =
					pathSanitized.substring(0, startIndex) +
					allowedLinkSymbol +
					pathSanitized.substring(endIndex + 1, pathSanitized.length);
			}

			menu = [
				...menu,
				{
					title: pathSanitized
						? pathSanitized.substring(pathSanitized.lastIndexOf('/') + 1)
						: 'home',
					link: pathSanitized ? pathSanitized : '/',
					dynamiclyEditedPath: dynamiclyEditedPaths
				}
			];
		}
	});
</script>

<div {...$$props} class={twMerge('text-sm breadcrumbs min-w-0', className)}>
	<ul>
		{#each crumbs as crumb}
			{#if crumb}
				<li>
					<a
						href={crumb.href}
						class="hover:text-light_primary dark:hover:text-dark_primary"
					>
						{crumb.label}
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</div>
