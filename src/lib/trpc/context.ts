import prisma from "../prisma"
import type { RequestEvent } from "@sveltejs/kit";
import type { inferAsyncReturnType } from "@trpc/server";

// Creates trpc context
export async function createContext(event: RequestEvent) {
  return {
    prisma: prisma
  }
}

export type Context = inferAsyncReturnType<typeof createContext>