import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma.js'

export const load = async ({ params }) => {
  const testId = params.test as string

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
      }
    }
  })

  if (!test) {
    throw redirect(307, "/dashboard/my-groups")
  }

  if (!test.testVersions[0].id) throw redirect(307, "/dashboard/my-groups")

  return {
    totalPoints: test.testVersions[0].totalPoints,
    test: test
  }
}