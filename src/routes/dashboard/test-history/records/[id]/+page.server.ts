import { redirect, type ServerLoad } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";

export const load: ServerLoad = async (request) => {
  const id = request.params.id
  console.log(id)
  if (!id) throw redirect(302, "/dashboard")

  const context = await createContext(request)
  const record = await appRouter.createCaller(context).records.getTestRecordById({ id: id });

  if (!record.record) throw redirect(302, "/dashboard")

  return {
    record: record.record
  }
}