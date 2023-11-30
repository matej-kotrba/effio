import { redirect, type ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";


// TODO: Can be client, no .server needed
export const load: ServerLoad = async (request) => {
  const id = request.params.id
  console.log(id)
  if (!id) throw redirect(307, "/dashboard")

  const context = await createContext(request)
  const record = appRouter.createCaller(context).records.getTestRecordById({ id: id });

  // if (!record.record) throw redirect(307, "/dashboard")

  return {
    streaming: {
      record: record
    }
  }
}