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
			"onclickoutside"?: (event: CustomEvent<MouseEvent>) => void;
			"onquestionDetails"?: (event: CustomEvent<{ detail: QuestionContent }>) => void;
			"ontitleDetails"?: (event: CustomEvent<{ detail: string }>) => void;
		}
	}
}

export { };
