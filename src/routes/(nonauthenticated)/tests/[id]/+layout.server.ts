import { redirect, type ServerLoad } from "@sveltejs/kit";
import { appRouter } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context"
import { transformTestToTakeFormat } from "~/lib/utils/testTransform";
import prisma from "~/lib/prisma";

// TODO: Can be client, no .server needed
export const load: ServerLoad = async (request) => {

  const id = request.params.id;

  if (!id) throw redirect(307, "/?message=This test does not exist&type=error")

  const context = await createContext(request)

  const test = await appRouter.createCaller(context).getTestById({ id: id });

  if (!test) throw redirect(307, "/?message=This test does not exist&type=error")

  try {
    return {
      testContent: {
        ...test,
        ...transformTestToTakeFormat(test)
      }
    }
  }
  catch (e) {
    throw redirect(307, "/?message=This test does not exist&type=error")
  }

}