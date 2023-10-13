import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "$lib/prisma"
import type { trpc } from "~/lib/trpc/client";
import { transformTestToTakeFormat } from "~/lib/utils/testTransform";

export const load: ServerLoad = async ({ params }) => {
  const id = params.testId

  if (!id) {
    throw redirect(307, "/dashboard/my-groups")
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
      },
      include: {
        testVersions: {
          include: {
            questions: {
              include: {
                type: true
              }
            }
          }
        }
      }
    })

    if (!test) {
      throw new Error("No test found")
    }

    console.log(test)

    return {
      testContent: transformTestToTakeFormat(test)
    }
  }
  catch (e) {
    throw redirect(307, "/dashboard/my-groups")
  }
}