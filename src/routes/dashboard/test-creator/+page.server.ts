import type { ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { router } from "~/lib/trpc/router";

export const load: ServerLoad = async (event) => {
  const templates = router.createCaller(await createContext(event)).getTemplates();
  return {
    templates: templates
  }
}