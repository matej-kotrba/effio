import type { ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";

// TODO: Can be client, no .server needed
export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const templatesPromise = appRouter.createCaller(context).getTemplates();
  const questionTemplatesPromise = appRouter.createCaller(context).getQuestionsTypes({
    onlyRegular: true
  })
  const programmingTemplatePromise = appRouter.createCaller(context).getQuestionsTypes({
    onlyProgramming: true
  })

  const [templates, questionTemplates, programmingTemplate] = await Promise.all([templatesPromise, questionTemplatesPromise, programmingTemplatePromise])

  // const data = await prisma.questionType.delete({
  //   where: {
  //     slug: "programming",
  //     type: "SPECIAL"
  //   }
  // })
  // console.log(data)

  return {
    templates: templates,
    questionTemplates: questionTemplates,
    programmingTemplate: programmingTemplate[0]
  }
}