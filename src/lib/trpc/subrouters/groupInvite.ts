import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import { TRPCError } from "@trpc/server"
import { randomId } from "~helpers/randomId"

export const groupInvitesRouter = router({
  createInvite: loggedInProcedure.input(z.object({
    groupId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.group.findUnique({
      where: {
        id: input.groupId,
      }
    })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    if (group.ownerId !== ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create invite" })
    }

    const invite = await ctx.prisma.groupInvite.findFirst({
      where: {
        groupId: input.groupId,
        createdAt: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24)
        }
      }
    })

    if (invite) return invite
    else {
      return await ctx.prisma.groupInvite.create({
        data: {
          id: randomId(),
          groupId: input.groupId,
        }
      })
    }

  })
})