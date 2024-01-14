import type { ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";
// import prisma from "~/lib/prisma"

// TODO: Can be client, no .server needed
export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const questionsTypes = appRouter.createCaller(context).getQuestionsTypes();

  // await prisma.group.delete({
  //   where: {
  //     id: "f5b240a4-ef37-4923-87ab-ceb94d3e613f"
  //   }
  // })

  return {
    questionsTypes: questionsTypes
  }
}