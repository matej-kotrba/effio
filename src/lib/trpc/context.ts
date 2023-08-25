import prisma from "../prisma"
import type { RequestEvent } from "@sveltejs/kit";
import type { inferAsyncReturnType } from "@trpc/server";



// Creates trpc context
export async function createContext(event: RequestEvent) {
  const session = await event.locals.getSession()
  return {
    prisma: prisma,
    user: (session as (UpdatedSession | null))?.user
  }
}

export type Context = inferAsyncReturnType<typeof createContext>