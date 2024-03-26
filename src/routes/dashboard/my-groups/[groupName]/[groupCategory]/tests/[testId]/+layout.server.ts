import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "$lib/prisma"
import { transformTestToTakeFormat } from "~/lib/utils/testTransform";

export const load: ServerLoad = async ({ params, locals }) => {
  const id = params.testId
  const session = (await locals.getSession()) as UpdatedSession

  if (!session) {
    throw redirect(307, "/login")
  }

  if (!id) {
    throw redirect(307, "/dashboard/my-groups")
  }

  const userId = session.user?.id

  if (!userId) {
    throw redirect(307, "/login")
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
        id: id,
        subcategories: {
          some: {
            subcategory: {
              group: {
                slug: params.name
              },
              slug: params.category
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            stars: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        testVersions: {
          include: {
            questions: {
              include: {
                type: true
              }
            },
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        stars: userId ? {
          select: {
            userId: true,
            testId: true
          },
          where: {
            userId: userId
          }
        } : undefined,
        owner: true
      }
    })

    if (!test) {
      throw new Error("No test found")
    }

    return {
      testContent: {
        ...test,
        ...transformTestToTakeFormat(test)
      }
    }
  }
  catch (e) {
    throw redirect(307, "/dashboard/my-groups")
  }
}