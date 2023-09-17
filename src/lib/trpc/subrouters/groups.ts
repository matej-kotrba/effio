import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import { TRPCError } from "@trpc/server"

function tranformString(text: string) {
  let transformedText = ""
  for (const char of text.toLowerCase().replace(/ /g, "-")) {
    if (char.match(/[a-zA-Z0-9-]/)) {
      transformedText += char
    }
    else {
      transformedText += char.charCodeAt(0)
    }
  }
  return transformedText
}

function transformStringIntoSlug(text: string, username: string) {
  const transformedText = tranformString(text)
  const transformedUsername = tranformString(username)
  return `${transformedUsername}:${transformedText}`
}

export const groupsRouter = router({
  createGroup: loggedInProcedure.input(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const newGroup = await ctx.prisma.group.create({
      data: {
        name: input.name,
        description: input.description,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ownerId: ctx.user!.id!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        slug: transformStringIntoSlug(input.name, ctx.user!.name!),
      }
    })

    return newGroup
  }),
  updateGroup: loggedInProcedure.input(z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.group.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name,
        description: input.description,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        slug: input?.name ? transformStringIntoSlug(input.name, ctx.user!.name!) : undefined,
      }
    })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    return group
  }),
  deleteGroup: loggedInProcedure.input(z.object({
    id: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const deletedGroup = await ctx.prisma.group.delete({
      where: {
        id: input.id
      }
    })

    if (!deletedGroup) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    return deletedGroup
  }),
  getGroupById: loggedInProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    const group = await ctx.prisma.group.findUnique({
      where: {
        id: input.id
      },
      include: {
        tests: true,
        users: true
      }
    })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    return group
  }),
  getAllUsersGroup: loggedInProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    const groups = await ctx.prisma.group.findMany({
      where: {

      }
    })
  })
})