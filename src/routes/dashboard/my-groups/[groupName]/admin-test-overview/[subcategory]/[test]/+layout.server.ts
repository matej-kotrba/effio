import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma.js'

export const load = async ({ params }) => {
  const testId = params.test as string
  const subcategorySlug = params.subcategory as string

  const test = await prisma.test.findUnique({
    where: {
      id: testId,
    },
    include: {
      testVersions: {
        orderBy: {
          version: "desc"
        },
        take: 1,
      },
      tags: {
        include: {
          tag: true
        }
      },
      subcategories: {
        where: {
          testId: testId,
          subcategory: {
            slug: subcategorySlug
          }
        },
        select: {
          addedDate: true
        }
      }
    }
  })

  if (!test) {
    redirect(307, "/dashboard/my-groups");
  }

  if (!test.testVersions[0].id) redirect(307, "/dashboard/my-groups");

  return {
    totalPoints: test.testVersions[0].totalPoints,
    test: test
  }
}