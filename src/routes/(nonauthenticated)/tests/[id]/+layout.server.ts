import { redirect, type ServerLoad } from "@sveltejs/kit";
import { appRouter } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context"
import { transformTestToTakeFormat } from "~/lib/utils/testTransform";

export const load: ServerLoad = async (request) => {

  const id = request.params.id;

  if (!id) throw redirect(307, "/")

  const context = await createContext(request)

  const test = await appRouter.createCaller(context).getTestById({ id: id });

  if (!test) throw redirect(307, "/")

  let resultTest;

  try {
    resultTest = transformTestToTakeFormat(test)
  }
  catch (e) {
    throw redirect(307, "/")
  }

  return {
    testContent: {
      ...resultTest,
    }
  }
}