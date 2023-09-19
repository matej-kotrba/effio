import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { trpcServer } from "~helpers/trpcServer";

export const load: PageServerLoad = async (event) => {

  const id = ((await event.locals.getSession()) as UpdatedSession)?.user?.id

  if (!id) {
    throw redirect(301, "/login")
  }

  const groupFullData = await (await trpcServer(event)).groups.getGroupByName({
    id: id,
    name: event.params.name,
    includeTests: true,
    includeUsers: true
  })

  if (!groupFullData) {
    throw redirect(301, "/dashboard/my-groups")
  }

  return {
    group: groupFullData
  }
}