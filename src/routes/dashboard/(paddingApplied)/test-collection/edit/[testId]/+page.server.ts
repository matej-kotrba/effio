import { redirect, type ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";


// TODO: Can be client, no .server needed
export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const dataPromise = appRouter.createCaller(context).getTestById({ id: event.params.testId as string, includeGroupSubcategories: true });
  const programmingTemplatesPromise = appRouter.createCaller(context).getQuestionsTypes({ onlyProgramming: true })

  const questionTemplatesPromise = appRouter.createCaller(context).getQuestionsTypes({
    onlyRegular: true
  })

  const [data, programmingTemplates, questionTemplates] = await Promise.all([dataPromise, programmingTemplatesPromise, questionTemplatesPromise])

  if (data === null) {
    throw redirect(307, "/dashboard/test-collection")
  }
  else {
    return {
      testData: data as NonNullable<typeof data>,
      questionTemplates: questionTemplates,
      programmingTemplate: programmingTemplates[0]
    }
  }
}