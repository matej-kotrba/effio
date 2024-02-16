import { z } from "zod"
import { adminProcedure, procedure, router } from "../../setup"
import { TRPCError } from "@trpc/server"

export const adminRouter = router({
  getUsersAdmin: adminProcedure.input(z.object({
    limit: z.number(),
    cursor: z.string().optional(),
    searchQuery: z.string().optional(),
    order: z.enum(["stars", "date"]).optional(),
    skip: z.number().optional(),
  })).query(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.findMany({
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      take: input.limit,
      skip: input.skip,
      where: {
        name: {
          contains: input.searchQuery ? input.searchQuery : undefined
        },
      },
    })
    return users
  })
})