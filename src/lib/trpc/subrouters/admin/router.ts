import { z } from "zod"
import { adminLoggingProcedure, adminProcedure, router } from "../../setup"
import { TRPCError } from "@trpc/server"

export const adminRouter = router({
  getUsersAdmin: adminLoggingProcedure.meta({ action: "DELETE_USERS" }).input(z.object({
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
  deleteUsersAdmin: adminLoggingProcedure.input(z.object({
    usersIds: z.array(z.string())
  })).mutation(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.deleteMany({
      where: {
        id: {
          in: input.usersIds
        }
      }
    })

    return users
  })
})