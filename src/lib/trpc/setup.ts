import { TRPCError, initTRPC } from "@trpc/server"
import type { Context } from "./context";
import superjson from "superjson"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TRCPMeta { }

type TRPCMetaAdminAction = "DELETE_USERS"

// Admin extension
interface TRCPMeta {
  action?: TRPCMetaAdminAction;
}

export const t = initTRPC.context<Context>().meta<TRCPMeta>().create(
  {
    transformer: superjson
  }
)
export const router = t.router
export const procedure = t.procedure

const isLoggedIn = t.middleware(async (opts) => {
  if (opts.ctx.user === undefined || opts.ctx.user === null || opts.ctx.user.id === undefined || opts.ctx.user.id === null || opts.ctx.user.name === undefined || opts.ctx.user.name === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" })
  }
  return opts.next({
    ctx: {
      userId: opts.ctx.user.id
    }
  })
})

const isAdmin = t.middleware(async (opts) => {
  if (opts.ctx.user === undefined || opts.ctx.user === null || opts.ctx.user.id === undefined || opts.ctx.user.id === null || opts.ctx.user.name === undefined || opts.ctx.user.name === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" })
  }
  if (opts.ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized access" })
  }
  return opts.next({
    ctx: {
      userId: opts.ctx.user.id
    }
  })
})

const adminLogging = t.middleware(async (opts) => {
  const result = await opts.next()
  return result
})

export const loggedInProcedure = procedure.use(isLoggedIn)
export const adminProcedure = procedure.use(isAdmin)
export const adminLoggingProcedure = procedure.use(isAdmin).use(adminLogging)