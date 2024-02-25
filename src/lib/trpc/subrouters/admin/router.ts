import { z } from "zod"
import { adminProcedure, router, logAdminAction } from "../../setup"
import { TRPCError } from "@trpc/server"

export const adminRouter = router({
  getUsersAdmin: adminProcedure.input(z.object({
    limit: z.number(),
    cursor: z.string().optional(),
    searchQuery: z.string().optional(),
    order: z.enum(["stars", "date"]).optional(),
  })).query(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.findMany({
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      include: {
        accounts: {
          select: {
            provider: true,
          }
        }
      },
      where: {
        name: {
          contains: input.searchQuery ? input.searchQuery : undefined
        },
      },
      orderBy: {
        name: "asc"
      }
    })
    return users
  }),
  getTestsAdmin: adminProcedure.input(z.object({
    limit: z.number(),
    cursor: z.string().optional(),
    searchQuery: z.string().optional(),
    order: z.enum(["stars", "date"]).optional(),
  })).query(async ({ ctx, input }) => {
    const tests = await ctx.prisma.test.findMany({
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      include: {
        owner: {
          select: {
            name: true,
            id: true
          }
        }
      },
      where: {
        title: {
          contains: input.searchQuery ? input.searchQuery : undefined
        },
      },
      orderBy: {
        title: "asc"
      }
    })
    return tests
  }),
  deleteUsersAdmin: adminProcedure.input(z.object({
    usersIds: z.array(z.string())
  })).mutation(async ({ ctx, input }) => {
    const { count } = await ctx.prisma.user.deleteMany({
      where: {
        id: {
          in: input.usersIds
        }
      }
    })

    logAdminAction(ctx, {
      action: "DELETE_USERS",
      data: {
        count: count,
        ids: input.usersIds
      }
    })
    return count
  }),
  deleteTestsAdmin: adminProcedure.input(z.object({
    testsIds: z.array(z.string())
  })).mutation(async ({ ctx, input }) => {
    const { count } = await ctx.prisma.test.deleteMany({
      where: {
        id: {
          in: input.testsIds
        }
      }
    })

    logAdminAction(ctx, {
      action: "DELETE_TESTS",
      data: {
        count: count,
        ids: input.testsIds
      }
    })
    return count
  }),
  getAdminLogs: adminProcedure.input(z.object({
    limit: z.number(),
    cursor: z.string().optional(),
    searchQuery: z.string().optional(),
    order: z.enum(["stars", "date"]).optional(),
  })).query(async ({ ctx, input }) => {
    const logs = await ctx.prisma.adminLogs.findMany({
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
    })
    return logs
  }),
  changeUserRole: adminProcedure.input(z.object({
    userId: z.string(),
    role: z.enum(["ADMIN", "USER"])
  })).mutation(async ({ ctx, input }) => {
    const previousRole = await ctx.prisma.user.findUnique({
      where: {
        id: input.userId
      },
      select: {
        role: true
      }
    })
    if (!previousRole) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    }
    const user = await ctx.prisma.user.update({
      where: {
        id: input.userId
      },
      data: {
        role: input.role
      }
    })

    logAdminAction(ctx, {
      action: "CHANGE_USER_ROLE",
      data: {
        userId: user.id,
        previousRole: previousRole.role,
        role: user.role
      }
    })

    return user
  })
})