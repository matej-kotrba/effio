import type { ServerLoad } from "@sveltejs/kit";
import { router } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context";
import type { TestFullType } from "~/Prisma";

export const load: ServerLoad = async (event) => {
  const recentTests = await router.createCaller(await createContext(event)).getTests({
    limit: 3
  })

  return {
    tests: {
      recentTests: recentTests as TestFullType[] || [],
    }
  }
}