import { TRPCError, initTRPC } from "@trpc/server"
import type { Context } from "./context";
import superjson from "superjson"
import type { AdminLogsActions, User } from "@prisma/client";

export const t = initTRPC.context<Context>().create(
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

export const loggedInProcedure = procedure.use(isLoggedIn)
export const adminProcedure = procedure.use(isAdmin)

type AdminActionsHelper = {
  [key in AdminLogsActions]: key;
}

type AdminLogContentObject = {
  action: AdminActionsHelper["DELETE_USERS"]
  data: { count: number, ids: string[] }
} | {
  action: AdminActionsHelper["BLOCKED_USERS"]
  data: User[]
}

// Admin log function
export async function logAdminAction(ctx: Context, content: AdminLogContentObject) {
  console.log("logAdminAction", ctx.user)
  if (!ctx.user?.id || ctx.user.role !== "ADMIN") {
    return
  }
  let adminLogActionString = ""

  if (content.action === "DELETE_USERS") {
    adminLogActionString = "Deleted " + content.data.count + " users: " + content.data.ids.join(", ")
  }
  else if (content.action === "BLOCKED_USERS") {
    adminLogActionString = "Blocked users: " + content.data.map(user => user.name).join(", ")
  }
  else {
    return
  }

  const log = await ctx.prisma.adminLogs.create({
    data: {
      action: content.action,
      message: adminLogActionString,
      userId: ctx.user.id,
    }
  })

  console.log(log)
}