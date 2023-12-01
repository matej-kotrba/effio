import type { ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";

// TODO: Can be client, no .server needed
export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const templates = appRouter.createCaller(context).getTemplates();
  const questionTemplates = await appRouter.createCaller(context).getQuestionsTypes({
    onlyRegular: true
  })
  console.log(questionTemplates)

  // const data = await prisma.questionType.delete({
  //   where: {
  //     slug: "programming",
  //     type: "SPECIAL"
  //   }
  // })
  // console.log(data)

  return {
    templates: templates,
    questionTemplates: questionTemplates
  }
}