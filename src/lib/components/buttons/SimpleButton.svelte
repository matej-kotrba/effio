<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { ButtonProps } from 'bits-ui';

	type Variants = 'highlight' | 'filled' | 'ghost';
	type DesignType = 'primary' | 'basic';

	export let onClick: () => void = () => {};
	export let variant: Variants = 'highlight';
	export let designType: DesignType = 'basic';

	type $$Props = ButtonProps & {
		onClick?: () => void;
		variant?: Variants;
		designType?: DesignType;
		class?: string;
	};

	let styles = '';
	$: {
		switch (variant) {
			case 'highlight':
				styles =
					'relative px-4 py-2 font-normal \
					duration-200 rounded-md ';
				switch (designType) {
					case 'primary': {
						styles +=
							'bg-light_grey dark:bg-dark_grey hover:bg-gray-200 dark:hover:bg-dark_light_grey\
					hover:text-light_primary dark:hover:text-white';
						break;
					}
					case 'basic': {
						styles +=
							'bg-light_grey dark:bg-dark_grey hover:bg-gray-200 dark:hover:bg-dark_light_grey\
					hover:text-light_primary dark:hover:text-white';
					}
				}
				break;
			case 'filled':
				styles = 'relative px-4 py-2 rounded-md duration-200 ';
				switch (designType) {
					case 'primary': {
						styles +=
							'bg-light_primary text-light_white font-semibold hover:bg-light_primary_dark\
							 dark:bg-dark_primary dark:text-dark_white dark:hover:bg-dark_primary_dark';
						break;
					}
					case 'basic': {
						styles +=
							'dark:bg-dark_light_grey dark:hover:bg-dark_terciary bg-light_grey hover:bg-light_grey_dark';
						break;
					}
				}
				break;
			case 'ghost':
				styles = 'relative px-4 py-2 rounded-md bg-transparent  duration-200 ';
				switch (designType) {
					case 'primary': {
						styles +=
							'hover:bg-light_primary dark:hover:bg-dark_primary hover:text-light_white dark:hover:text-white';
						break;
					}
					case 'basic': {
						styles += 'hover:bg-light_grey dark:hover:bg-dark_light_grey';
						break;
					}
				}
				break;
		}
	}

	let classes = '';
	export { classes as class };
</script>

<button
	type="button"
	on:click={onClick}
	class={twMerge(styles, classes)}
	{...$$restProps}
>
	<slot />
</button>
