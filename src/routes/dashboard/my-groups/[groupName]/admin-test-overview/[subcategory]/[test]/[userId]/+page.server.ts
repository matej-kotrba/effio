import prisma from '~/lib/prisma.js'

export const load = async ({ params }) => {
  const testId = params.test as string
  const userId = params.userId as string
  const subcategorySlug = params.subcategory as string

  const testRecords = prisma.testRecord.findMany({
    where: {
      test: {
        testId: testId
      },
      subcategory: {
        slug: subcategorySlug
      },
      userId: userId,
      shouldCountToStatistics: true
    },
    select: {
      createdAt: true,
      userPoints: true,
      userId: true,
      test: {
        select: {
          totalPoints: true,
          markSystemJSON: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return {
    usersTestRecords: testRecords
  }
}