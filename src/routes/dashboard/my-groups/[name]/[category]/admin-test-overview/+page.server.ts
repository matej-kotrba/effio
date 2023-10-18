import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "~/lib/prisma";
import type { trpc } from "~/lib/trpc/client";

export const load: ServerLoad = async ({ locals, parent, params }) => {

  const { group } = await parent() as {
    group: Awaited<
      ReturnType<
        ReturnType<typeof trpc>['groups']['getGroupByName']['query']
      >
    >
  }

  if (!group) throw redirect(307, "/dashboard/my-groups")

  const user = (await locals.getSession() as UpdatedSession)?.user
  if (!user) throw redirect(307, "/dashboard/my-groups")

  if (group.ownerId !== user.id) throw redirect(307, "/dashboard/my-groups")

  const categorySlug = params.category as string

  if (!categorySlug) throw redirect(307, "/dashboard/my-groups")

  const tests = await prisma.groupSubcategoryOnTests.findMany({
    where: {
      subcategory: {
        slug: categorySlug,
        groups
      },
    }
  })
}  