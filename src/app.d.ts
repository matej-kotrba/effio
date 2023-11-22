import type { Session } from "@auth/core/types";
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	type UpdatedSession = Session & {
		user?: {
			id?: string | null
		};
	}

	declare namespace svelteHTML {
		// interface HTMLProps<T> {
		// 	"on:intersect"?: (event: CustomEvent<IntersectionObserverEntry>) => void;
		// 	"on:unintersect"?: (event: CustomEvent<IntersectionObserverEntry>) => void;
		// 	"on:clickoutside"?: (event: CustomEvent<MouseEvent>) => void;
		// 	"on:questionDetails"?: (event: CustomEvent<{ detail: QuestionContent }>) => void;
		// 	"on:titleDetails"?: (event: CustomEvent<{ detail: string }>) => void;
		// 	"on:deleteInput"?: (event: CustomEvent) => void;
		// 	"on:finalize"?: (event: CustomEvent) => void;
		// 	"on:consider"?: (event: CustomEvent) => void;
		// 	"on:dnddrag"?: (event: CustomEvent) => void;
		// 	"on:imageerror"?: (event: CustomEvent) => void
		// }
		interface HTMLAttributes<T> {
			"on:intersect"?: (event: CustomEvent<IntersectionObserverEntry>) => void;
			"on:unintersect"?: (event: CustomEvent<IntersectionObserverEntry>) => void;
			"on:clickoutside"?: (event: CustomEvent<MouseEvent>) => void;
			"on:questionDetails"?: (event: CustomEvent<{ detail: QuestionContent }>) => void;
			"on:titleDetails"?: (event: CustomEvent<{ detail: string }>) => void;
			"on:deleteInput"?: (event: CustomEvent) => void;
			"on:finalize"?: (event: CustomEvent) => void;
			"on:consider"?: (event: CustomEvent) => void;
			"on:dnddrag"?: (event: CustomEvent) => void;
			"on:imageerror"?: (event: CustomEvent) => void
		}
	}
}

export { };
