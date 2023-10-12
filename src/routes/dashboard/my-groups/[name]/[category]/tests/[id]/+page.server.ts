import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "$lib/prisma"
import type { trpc } from "~/lib/trpc/client";

export const load: ServerLoad = async ({ params, parent }) => {
  const id = params.id

  console.log(id)

  if (!id) {
    throw redirect(302, "/dashboard/my-groups")
  }

  try {
    let parentData = await parent()
    if (!parentData || !parentData.group) {
      throw new Error("No parent data")
    }

    // parentData = parentData as Awaited<
    //   ReturnType<ReturnType<typeof trpc>["groups"]['getGroupByName']['query']>
    // >;
    // parentData.
    // console.log(params)
    // const test = await prisma.groupSubcategoryOnTests.findFirst({
    //   where: {

    //   }
    // })
  }
  catch (e) {
    throw redirect(302, "/dashboard/my-groups")
  }
}