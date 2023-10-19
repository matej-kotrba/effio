import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "~/lib/prisma";
import type { trpc } from "~/lib/trpc/client";

export const load: ServerLoad = async ({ parent, params }) => {
  const { group } = await parent() as {
    group: Awaited<
      ReturnType<
        ReturnType<typeof trpc>['groups']['getGroupByName']['query']
      >
    >
  }

  const categorySlug = params.category as string

  if (!categorySlug) throw redirect(307, "/dashboard/my-groups")

  const tests = await prisma.groupSubcategoryOnTests.findMany({
    where: {
      subcategory: {
        slug: categorySlug,
        group: {
          id: group?.id
        }
      },
    },
    include: {
      test: {
        include: {
          testVersions: {
            orderBy: {
              createdAt: "desc"
            },
            include: {
              records: true
            }
          }
        }
      }
    }
  })

  return {
    tests: tests
  }
}  