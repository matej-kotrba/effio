import type { Session } from "@auth/core/types";
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	type UpdatedSession = Session & {
		user?: {
			id?: string | null
		};
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}

		interface Locals {
			getSession(): Promise<UpdatedSession | null>;
		}

		interface PageData {
			session: UpdatedSession | null;
		}
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
			"on:intersect"?: (event: T<IntersectionObserverEntry>) => void;
			"on:unintersect"?: (event: T<IntersectionObserverEntry>) => void;
			"on:clickoutside"?: (event: T<MouseEvent>) => void;
			"on:questionDetails"?: (event: T<{ detail: QuestionContent }>) => void;
			"on:titleDetails"?: (event: T<{ detail: string }>) => void;
			"on:deleteInput"?: (event: T) => void;
			"on:finalize"?: (event: T) => void;
			"on:consider"?: (event: T) => void;
			"on:dnddrag"?: (event: T) => void;
			"on:imageerror"?: (event: T) => void
		}

		interface SVGAttributes<T> {
			"on:intersect"?: (event: T<IntersectionObserverEntry>) => void;
			"on:unintersect"?: (event: T<IntersectionObserverEntry>) => void;
		}
	}
}

export { };
