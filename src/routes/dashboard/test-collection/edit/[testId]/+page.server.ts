import { redirect, type ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { router } from "~/lib/trpc/router";

export const load: ServerLoad = async (event) => {

  const context = await createContext(event)

  const data = await router.createCaller(context).getTestById({ id: event.params.testId as string });

  if (!data) {
    throw redirect(302, "/dashboard/test-collection")
  }
  return {
    testData: data
  }
}