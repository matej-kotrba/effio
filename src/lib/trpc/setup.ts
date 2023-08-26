import { TRPCError, initTRPC } from "@trpc/server"
import type { Context } from "./context";
import superjson from "superjson"

export const t = initTRPC.context<Context>().create(
  {
    transformer: superjson
  }
)
export const router = t.router
export const procedure = t.procedure

const isLoggedIn = t.middleware(async (opts) => {
  if (!opts.ctx.user || !opts.ctx.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" })
  }
  return opts.next({
    ctx: {
      userId: opts.ctx.user.id as string
    }
  })
})

export const loggedInProcedure = procedure.use(isLoggedIn)