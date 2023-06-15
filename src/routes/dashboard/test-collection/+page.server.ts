import type { ServerLoad } from "@sveltejs/kit";
import { router } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context";
import type { TestFullType } from "~/Prisma";

export const load: ServerLoad = async (event) => {
  const publishedTestPromise = router.createCaller(await createContext(event)).getTests({
    isPublished: true,
    limit: 3
  })
  const draftTestPromise = router.createCaller(await createContext(event)).getTests({
    isPublished: false,
    limit: 3
  })

  const [publishedTest, draftTest] = await Promise.all([publishedTestPromise, draftTestPromise])

  return {
    tests: {
      published: publishedTest as TestFullType[],
      drafts: draftTest as TestFullType[]
    }
  }
}