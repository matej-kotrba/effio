// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	declare namespace svelte.JSX {
		interface HTMLProps<T> {
			"onintersect"?: (event: CustomEvent<IntersectionObserverEntry>) => void;
			"onunintersect"?: (event: CustomEvent<IntersectionObserverEntry>) => void;
		}
	}
}

export { };
