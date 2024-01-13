import { redirect, type ServerLoad } from "@sveltejs/kit";
import { appRouter } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context"
import { transformTestToTakeFormat } from "~/lib/utils/testTransform";
import { trpcServer } from "~helpers/trpcServer";

// TODO: Can be client, no .server needed
export const load: ServerLoad = async (request) => {

  const id = request.params.id;

  if (!id) throw redirect(307, "/?message=This test does not exist&type=error")

  const context = await createContext(request)

  const test = await appRouter.createCaller(context).getTestById({ id: id });

  if (!test) throw redirect(307, "/?message=This test does not exist&type=error")

  const transformed = transformTestToTakeFormat(test)

  const returnedData = {
    ...test,
    ...transformed
  }

  const viewCount = await (await trpcServer(request)).getTestViewCount({ testId: id })

  try {
    return {
      testContent: returnedData,
      viewCount: viewCount
    }
  }
  catch (e) {
    throw redirect(307, "/?message=This test does not exist&type=error")
  }

}