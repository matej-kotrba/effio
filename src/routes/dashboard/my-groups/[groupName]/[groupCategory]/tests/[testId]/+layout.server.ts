import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "$lib/prisma"
import { transformTestToTakeFormat } from "~/lib/utils/testTransform";

export const load: ServerLoad = async ({ params, locals }) => {
  const id = params.testId
  const subcategorySlug = params.groupCategory
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
    const testPromise = prisma.test.findUnique({
      where: {
        id: id,
        subcategories: {
          some: {
            subcategory: {
              group: {
                slug: params.name
              },
              slug: params.category,
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
        subcategories: {
          where: {
            testId: id,
            subcategory: {
              slug: subcategorySlug
            }
          },
          take: 1,
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
            records: {
              select: {
                id: true,
                createdAt: true,
                userPoints: true,
              },
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
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

    const numberOfTriesCountPromise = prisma.userSubcategoryTestStartLog.count({
      where: {
        userId: userId,
        testId: id,
        subcategory: {
          slug: subcategorySlug
        }
      }
    })


    const [test, numberOfTriesCount] = await Promise.all([testPromise, numberOfTriesCountPromise])

    if (!test) {
      throw new Error("No test found")
    }

    // Doing it here because typesafety of records on client does not work
    // const maxPoints = test.testVersions[0].totalPoints
    // const userPoints = test.testVersions[0].records.reduce((acc, record) => {
    //   return acc + record.userPoints
    // }, 0)
    // const percantage = (userPoints / maxPoints) * 100

    return {
      testContent: {
        ...test,
        ...transformTestToTakeFormat(test)
      },
      numberOfTriesCount,
    }
  }
  catch (e) {
    throw redirect(307, "/dashboard/my-groups")
  }
}