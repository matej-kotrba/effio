import { z } from "zod"
import { adminProcedure, router, logAdminAction } from "../../setup"
import { TRPCError } from "@trpc/server"

export const adminRouter = router({
  getUsersAdmin: adminProcedure.meta({ action: "DELETE_USERS" }).input(z.object({
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
  })
})