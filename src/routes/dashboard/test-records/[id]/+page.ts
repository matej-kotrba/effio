import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ url }) => {
  const id = url.pathname
}