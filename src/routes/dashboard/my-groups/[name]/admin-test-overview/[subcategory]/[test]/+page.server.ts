import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "~/lib/prisma";

export const load: ServerLoad = async ({ parent, params }) => {
  const testId = params.test as string
  const subacategorySlug = params.subcategory as string

  console.log(testId, subacategorySlug, params)
  if (!testId || !subacategorySlug) throw redirect(307, "/dashboard/my-groups")

  const test = await prisma.test.findUnique({
    where: {
      id: testId
    },
    include: {
      testVersions: {
        orderBy: {
          version: "desc"
        },
        take: 1,
        select: {
          totalPoints: true
        }
      }
    }
  })

  if (!test) {
    throw redirect(307, "/dashboard/my-groups")
  }

  const recordsAvg = await prisma.testRecord.aggregate({
    where: {
      test: {
        testGroup: {
          id: testId
        }
      },
      subcategory: {
        slug: subacategorySlug
      }
    },
    _avg: {
      userPoints: true
    },
    _count: true,
  })

  return {
    avarage: recordsAvg._avg.userPoints,
    count: recordsAvg._count,
    totalPoints: test?.testVersions[0].totalPoints
  }

  // const tests = await prisma.groupSubcategoryOnTests.findMany({
  //   where: {
  //     subcategory: {
  //       slug: categorySlug,
  //       group: {
  //         id: group?.id
  //       }
  //     },
  //   },
  //   include: {
  //     test: {
  //       include: {
  //         testVersions: {
  //           orderBy: {
  //             createdAt: "desc"
  //           },
  //           include: {
  //             records: true
  //           }
  //         }
  //       }
  //     }
  //   }
  // })

  // return {
  //   tests: tests
  // }
}  