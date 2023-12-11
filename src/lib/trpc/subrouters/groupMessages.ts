import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import { TRPCError } from "@trpc/server"
import type { MessageTypes } from "@prisma/client"
import { chatInputSchema } from "~schemas/textInput"
import Pusher from "pusher"
import { PUSHER_APP_ID, PUSHER_SECRET } from "$env/static/private"
import { PUBLIC_PUSHER_CLUSTER, PUBLIC_PUSHER_KEY } from "$env/static/public"

const messageTypeEnum = ["MESSAGE", "TEST"] as const satisfies readonly MessageTypes[]

export const groupMessagesRouter = router({
  postMessage: loggedInProcedure.input(z.object({
    groupId: z.string(),
    subcategoryId: z.string(),
    type: z.enum(messageTypeEnum),
    message: z.string()
  })).mutation(async ({ ctx, input }) => {
    const parsedMessage = chatInputSchema.safeParse(input.message)
    if (!parsedMessage.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Message is not valid"
      })
    }

    if (!messageTypeEnum.includes(input.type)) throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Message type is not valid"
    })

    const group = await ctx.prisma.group.findUniqueOrThrow({
      where: {
        id: input.groupId
      },
    })

    const isOwner = group.ownerId === ctx.user?.id

    const user = await ctx.prisma.groupOnUsers.findFirst({
      where: {
        userId: ctx.userId,
        groupId: input.groupId
      }
    })

    if (!user && !isOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not in part of this group"
      })
    }

    // const subcategory = await ctx.prisma.groupSubcategory.findUniqueOrThrow({
    //   where: {
    //     id: input.subcategoryId
    //   }
    // })

    const message = await ctx.prisma.groupSubcategoryMessage.create({
      data: {
        content: input.message,
        messageType: input.type as MessageTypes,
        senderId: ctx.userId,
        groupSubcategoryId: input.subcategoryId
      },
      include: {
        test: {
          select: {
            title: true,
            description: true,
            imageUrl: true
          }
        },
        sender: true,
      },
    })

    // Post message with pusher
    const pusher = new Pusher({
      appId: PUSHER_APP_ID,
      key: PUBLIC_PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`group-${group.id}`, "new-message", message);

    return message
  })
})