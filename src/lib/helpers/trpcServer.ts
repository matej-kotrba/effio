import type { RequestEvent, ServerLoadEvent } from "@sveltejs/kit";
import { createContext } from "~/lib/trpc/context";
import { appRouter } from "~/lib/trpc/router";
// import prisma from "~/lib/prisma"

export async function trpcServer(event: RequestEvent | ServerLoadEvent) {
  const context = await createContext(event)
  return appRouter.createCaller(context)
}