import { redirect, type ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";


// TODO: Can be client, no .server needed
export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const data = appRouter.createCaller(context).getTestById({ id: event.params.testId as string, includeGroupSubcategories: true });

  const questionTemplates = appRouter.createCaller(context).getQuestionsTypes({
    onlyRegular: true
  })

  if (!data) {
    throw redirect(307, "/dashboard/test-collection")
  }
  return {
    testData: data,
    questionTemplates: questionTemplates
  }
}