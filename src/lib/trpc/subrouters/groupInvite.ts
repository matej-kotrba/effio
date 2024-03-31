import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import { TRPCError } from "@trpc/server"
import { randomId } from "~helpers/randomId"
import { JOIN_CODE_EXPIRATION_VALUE } from "~schemas/inviteCode"

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
          gt: new Date(Date.now() - JOIN_CODE_EXPIRATION_VALUE)
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

  }),

  joinGroupWithInvite: loggedInProcedure.input(z.object({
    inviteCode: z.string(),
  })).query(async ({ ctx, input }) => {
    const invite = await ctx.prisma.groupInvite.findUnique({
      where: {
        id: input.inviteCode
      }
    })

    if (!invite) {
      throw new TRPCError({ code: "NOT_FOUND", message: "This invite doesn't seem to exist." })
    }

    if (invite.createdAt <= new Date(Date.now() - JOIN_CODE_EXPIRATION_VALUE)) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sorry, this invite code has expired."
      })
    }

    const group = await ctx.prisma.group.findUnique({
      where: {
        id: invite.groupId
      }
    })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group you are trying to join doesn't seem to exist." })
    }

    const alreadyJoined = await ctx.prisma.groupOnUsers.findFirst({
      where: {
        groupId: invite.groupId,
        userId: ctx.userId
      }
    })

    if (alreadyJoined) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are already a member of this group." })
    }

    const isBannedFromGroup = await ctx.prisma.userOnGroupBan.findFirst({
      where: {
        userId: ctx.userId,
        groupId: invite.groupId
      }
    })

    if (isBannedFromGroup) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are banned from this group." })
    }

    await ctx.prisma.groupOnUsers.create({
      data: {
        groupId: invite.groupId,
        userId: ctx.userId
      }
    })

    return {
      success: true
    }
  })
})