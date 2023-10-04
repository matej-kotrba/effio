import { redirect, type ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";

export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const data = await appRouter.createCaller(context).getTestById({ id: event.params.testId as string, includeGroupSubcategories: true });

  if (!data) {
    throw redirect(302, "/dashboard/test-collection")
  }
  return {
    testData: data
  }
}