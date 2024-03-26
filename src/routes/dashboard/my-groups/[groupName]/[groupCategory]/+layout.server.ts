import { redirect, type ServerLoad } from "@sveltejs/kit";
import type { trpc } from "~/lib/trpc/client";

export const load: ServerLoad = async ({ params, parent }) => {
  const category = params.groupCategory

  const { group } = await parent() as {
    group: Awaited<
      ReturnType<
        ReturnType<typeof trpc>['groups']['getGroupByName']['query']
      >
    >
  }

  if (!group) {
    throw redirect(307, "/dashboard/my-groups")
  }

  const subcategory = group.groupsSubcategories.find(subcategory => subcategory.slug === category)

  if (!category || !subcategory) {
    throw redirect(307, `/dashboard/my-groups/${group.slug}`)
  }

  return {
    subcategory
  }
}