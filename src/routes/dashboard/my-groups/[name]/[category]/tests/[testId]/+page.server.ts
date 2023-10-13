import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "$lib/prisma"
import type { trpc } from "~/lib/trpc/client";

export const load: ServerLoad = async ({ params }) => {
  const id = params.testId

  console.log(id)

  if (!id) {
    throw redirect(302, "/dashboard/my-groups")
  }

  try {
    // const parentData = await parent() as {
    //   group: Awaited<
    //     ReturnType<ReturnType<typeof trpc>["groups"]['getGroupByName']['query']>
    //   >
    // }

    // if (!parentData || !parentData.group) {
    //   throw new Error("No parent data")
    // }

    const test = await prisma.test.findUnique({
      where: {
        id: id
      }
    })
  }
  catch (e) {
    throw redirect(302, "/dashboard/my-groups")
  }
}