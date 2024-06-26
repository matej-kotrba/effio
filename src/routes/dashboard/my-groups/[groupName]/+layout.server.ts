import { redirect } from "@sveltejs/kit";
import { trpcServer } from "~helpers/trpcServer";

// TODO: Can be client, no .server needed
export const load = async (event) => {
  const id = ((await event.locals.getSession()) as UpdatedSession)?.user?.id

  if (!id) {
    throw redirect(301, "/login")
  }

  const groupFullData = await (await trpcServer(event)).groups.getGroupByName({
    id: id,
    name: event.params.groupName,
    includeOwner: true,
    includeSubcategories: true,
  })

  if (!groupFullData) {
    throw redirect(301, "/dashboard/my-groups")
  }

  return {
    group: groupFullData,
  }
}