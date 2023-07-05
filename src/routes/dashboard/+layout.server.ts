import type { ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { router } from "~/lib/trpc/router";

export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const questionsTypes = router.createCaller(context).getQuestionsTypes();


  return {
    questionsTypes: questionsTypes
  }
}