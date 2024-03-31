import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import { TRPCError } from "@trpc/server"
import { transformCategoryNameToSlug } from "~/lib/utils/groupTransform"
import { DB_STRING_REGEX, MAX_GROUP_OWNER_COUNT } from "~helpers/constants"
import { trpcCheckForRateLimit } from "~/lib/server/redis/redis"
import { channelCreateSchema, channelDeleteSchema, channelUpdateSchema } from "~/routes/dashboard/my-groups/schemas"
import { channelNameSchema } from "~schemas/testValidation"
import { deleteImageFromCloudinary } from "~/lib/server/cloudinary/utils"

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
    name: z.string().regex(DB_STRING_REGEX),
    imageUrl: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const slug = transformStringIntoSlug(input.name, ctx.user!.name!)

    const result = await trpcCheckForRateLimit("groupCreation", ctx.userId, "creating groups")
    if (result) {
      throw result
    }

    const existingPost = await ctx.prisma.group.findUnique({
      where: {
        slug: slug
      }
    })

    if (existingPost) {
      throw new TRPCError({ code: "CONFLICT", message: "Group with same owner and name already exists." })
    }

    const userGroupsCount = await ctx.prisma.group.count({
      where: {
        ownerId: ctx.userId
      }
    })

    if (userGroupsCount >= MAX_GROUP_OWNER_COUNT) {
      throw new TRPCError({ code: "FORBIDDEN", message: `You can't have more than ${MAX_GROUP_OWNER_COUNT} groups` })
    }

    const newGroup = await ctx.prisma.group.create({
      data: {
        name: input.name,
        imageUrl: input.imageUrl,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ownerId: ctx.user!.id!,
        slug: slug,
        groupsSubcategories: {
          create: {
            name: "General",
            slug: transformCategoryNameToSlug("General"),
          }
        }
      }
    })

    const user = await ctx.prisma.groupOnUsers.create({
      data: {
        userId: ctx.userId,
        groupId: newGroup.id
      }
    })

    return newGroup
  }),
  updateGroup: loggedInProcedure.input(z.object({
    id: z.string(),
    name: z.string().regex(DB_STRING_REGEX).optional(),
    imageUrl: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("groupUpdate", ctx.userId, "updating groups")
    if (result) {
      throw result
    }

    // Intentionally not updating slug so the connection for anyone using it wont fail
    const group = await ctx.prisma.group.update({
      where: {
        id: input.id,
        ownerId: ctx.userId
      },
      data: {
        name: input.name,
        imageUrl: input.imageUrl,
        // slug: input?.name ? transformStringIntoSlug(input.name, ctx.user!.name!) : undefined,
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
    const result = await trpcCheckForRateLimit("groupDeletion", ctx.userId, "deleting groups")
    if (result) {
      throw result
    }
    const group = await ctx.prisma.group.findFirst({
      where: {
        id: input.id,
        ownerId: ctx.userId
      }
    })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    if (group.imageUrl) {
      deleteImageFromCloudinary(group.imageUrl, "groups")
    }

    const deletedGroup = await ctx.prisma.group.delete({
      where: {
        id: input.id,
        ownerId: ctx.userId
      }
    })

    if (!deletedGroup) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    return deletedGroup
  }),
  getGroupsByUserId: loggedInProcedure.input(z.object({
    id: z.string().optional(),
    alsoUser: z.boolean().optional(),
    includeUsers: z.boolean().optional(),
    includeSubcategories: z.boolean().optional(),
    excludeEmptyGroups: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    const userId = input.id ?? ctx.userId
    const group = await ctx.prisma.group.findMany({
      where: {
        groupsSubcategories: input.excludeEmptyGroups ? {
          some: {
            id: {
              startsWith: ""
            }
          }
        } : undefined,
        OR: input.alsoUser ? [
          {
            ownerId: userId,
          },
          {
            users: {
              some: {
                userId: userId
              }
            }
          },
        ] : [
          {
            ownerId: userId
          },
        ]
      },
      include: {
        users: input.includeUsers || false,
        groupsSubcategories: input.includeSubcategories ? {
          include: {
            tests: {
              select: {
                id: true
              }
            }
          }
        } : false
      }
    })

    return group
  }),
  getGroupById: loggedInProcedure.input(z.object({
    id: z.string(),
    includeSubcategories: z.boolean().optional(),
    includeOwner: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    // TODO: Think this through and try to find a way to store name as unique
    const group = await ctx.prisma.group.findFirst({
      where: {
        id: input.id,
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: {
            user: {
              name: "asc"
            }
          }
        },
        groupsSubcategories: input.includeSubcategories || false,
        owner: input.includeOwner || false,
      }
    })

    return group
  }),
  getGroupByName: loggedInProcedure.input(z.object({
    id: z.string(),
    name: z.string(),
    // includeUsers: z.boolean().optional(),
    includeSubcategories: z.boolean().optional(),
    includeOwner: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    // TODO: Think this through and try to find a way to store name as unique
    const group = await ctx.prisma.group.findFirst({
      where: {
        slug: input.name,
        OR: [
          {
            ownerId: input.id
          },
          {
            users: {
              some: {
                userId: input.id
              }
            }
          }
        ]
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              }
            }
          },
          orderBy: {
            user: {
              name: "asc"
            }
          }
        },
        groupsSubcategories: input.includeSubcategories || false,
        owner: input.includeOwner || false,
      }
    })

    return group
  }),
  getAllUsersGroup: loggedInProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    const groups = await ctx.prisma.group.findMany({
      where: {

      }
    })
  }),
  getGroupSubcategoriesByGroupId: loggedInProcedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const subcategories = await ctx.prisma.groupSubcategory.findMany({
      where: {
        groupId: input.id
      }
    })

    return subcategories
  }),
  getSubcategoriesByTestId: loggedInProcedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const subcategories = await ctx.prisma.groupSubcategoryOnTests.findMany({
      where: {
        testId: input.id
      },
    })

    return subcategories
  }),
  getSubcategoryTestsById: loggedInProcedure.input(z.object({
    id: z.string(),
    orderByDate: z.union([z.literal("asc"), z.literal("desc")]).optional(),
  })).query(async ({ ctx, input }) => {
    const tests = await ctx.prisma.groupSubcategoryOnTests.findMany({
      where: {
        subcategoryId: input.id
      },
      include: {
        test: true
      },
      orderBy: {
        addedDate: input.orderByDate === "desc" ? "desc" : "asc"
      }
    })
    return tests
  }),
  getSubcategoryTestsByIdWithRecords: loggedInProcedure.input(z.object({
    id: z.string(),
    orderByDate: z.union([z.literal("asc"), z.literal("desc")]).optional(),
    excludeOwnersRecords: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    const tests = await ctx.prisma.groupSubcategoryOnTests.findMany({
      where: {
        subcategoryId: input.id
      },
      include: {
        test: {
          include: {
            testVersions: {
              take: 1,
              orderBy: {
                version: "desc"
              },
              include: {
                _count: {
                  select: {
                    records: input.excludeOwnersRecords ? {
                      where: {
                        userId: {
                          not: ctx.userId
                        }
                      }
                    } : true
                  }
                }

              }
            }
          }
        }
      },
      orderBy: {
        addedDate: input.orderByDate === "desc" ? "desc" : "asc"
      }
    })
    return tests
  }),
  getSubcategoryMessagesByGroupSubcategoryId: loggedInProcedure.input(z.object({
    id: z.string(),
    take: z.number().optional(),
    cursor: z.string().optional(),
  })).query(async ({ ctx, input }) => {
    const messages = await ctx.prisma.groupSubcategoryMessage.findMany({
      where: {
        groupSubcategoryId: input.id
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
      orderBy: {
        createdAt: "desc"
      },
      take: input.take,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined
    })
    return messages
  }),
  getGroupUsers: loggedInProcedure.input(z.object({
    groupId: z.string(),
    excludeOwner: z.boolean().optional(),
    subcategorySlug: z.string().optional(),
    testId: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.number().optional(),
    select: z.object({
      email: z.boolean().optional(),
      emailVerified: z.boolean().optional(),
      image: z.boolean().optional(),
      name: z.boolean().optional(),
      count: z.boolean().optional(),
      joinedAt: z.boolean().optional(),
    }),
    ordering: z.object({
      order: z.union([z.literal("asc"), z.literal("desc")]),
      by: z.union([z.literal("count"), z.literal("name")])
    })
  })).query(async ({ ctx, input }) => {
    const group = await ctx.prisma.group.findUnique({
      where: {
        id: input.groupId,
      }
    })

    if (input.select[input.ordering.by] === false) throw new TRPCError({ code: "BAD_REQUEST", message: "You have to include the field you are ordering by" })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "This group doesn't seem to exist" })
    }

    const orderBy: Record<string, unknown> = {}

    switch (input.ordering.by) {
      case "name": {
        orderBy["name"] = input.ordering.order
        break
      }
      case "count": {
        orderBy["testRecords"] = {
          _count: input.ordering.order
        }
        break
      }
    }
    const users = await ctx.prisma.user.findMany({
      orderBy: orderBy,
      where: {
        groups: {
          some: {
            groupId: input.groupId
          }
        },
        id: input.excludeOwner ? {
          not: ctx.userId
        } : {}
      },
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      select: {
        id: true,
        name: input.select.name ? true : undefined,
        image: input.select.image ? true : undefined,
        email: input.select.email ? true : undefined,
        emailVerified: input.select.emailVerified ? true : undefined,
        groups: input.select.joinedAt ? {
          select: {
            joinedAt: true
          },
          where: {
            groupId: input.groupId
          }
        } : undefined,
        _count: input.select.count ? {
          select: {
            testRecords: {
              where: {
                subcategory: {
                  slug: input.subcategorySlug
                },
                test: {
                  testId: input.testId
                }
              }
            }
          }
        } : undefined
      }
    })

    return users
  }),

  getUsersTestRecordCount: loggedInProcedure.input(z.object({
    subcategorySlug: z.string(),
    testId: z.string(),
    userId: z.array(z.string()),
  })).query(async ({ ctx, input }) => {
    const count = await ctx.prisma.testRecord.groupBy({
      by: ["userId"],
      where: {
        userId: {
          in: input.userId
        },
        subcategory: {
          slug: input.subcategorySlug
        },
        test: {
          testId: input.testId
        }
      },
      _count: {
        id: true
      },
    })

    return count
  }),

  kickUsersFromGroup: loggedInProcedure.input(z.object({
    groupSlugOrId: z.string(),
    userIds: z.array(z.string()),
    shouldBeBanned: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("groupKick", ctx.userId, "kicking users from group")
    if (result) {
      throw result
    }

    if (input.userIds.includes(ctx.userId)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "You can't kick yourself" })
    }

    const group = (await ctx.prisma.group.findMany({
      where: {
        OR: [
          {
            slug: input.groupSlugOrId
          },
          {
            id: input.groupSlugOrId
          }
        ]
      }
    }))[0]

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    if (group.ownerId !== ctx.userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to kick users from this group" })
    }

    if (input.userIds.includes(group.ownerId)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "You can't kick the owner of the group" })
    }

    if (input.shouldBeBanned) {
      await ctx.prisma.$transaction([
        ctx.prisma.groupOnUsers.deleteMany({
          where: {
            group: {
              OR: [
                {
                  slug: input.groupSlugOrId
                },
                {
                  id: input.groupSlugOrId
                }
              ]
            },
            userId: {
              in: input.userIds
            }
          }
        }),
        ctx.prisma.userOnGroupBan.createMany({
          data: input.userIds.map(userId => {
            return {
              userId: userId,
              groupId: group.id
            }
          })
        })
      ])
    }
    else {
      await ctx.prisma.groupOnUsers.deleteMany({
        where: {
          group: {
            OR: [
              {
                slug: input.groupSlugOrId
              },
              {
                id: input.groupSlugOrId
              }
            ]
          },
          userId: {
            in: input.userIds
          }
        }
      })
    }

    return {
      success: true,
    }
  }),

  leaveGroup: loggedInProcedure.input(z.object({
    groupId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("groupLeave", ctx.userId, "leaving groups")
    if (result) {
      throw result
    }
    const group = await ctx.prisma.groupOnUsers.deleteMany({
      where: {
        groupId: input.groupId,
        userId: ctx.userId
      }
    })

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    return {
      success: true,
      group: group
    }
  }),

  createChannel: loggedInProcedure.input(channelCreateSchema).mutation(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("channelCreate", ctx.userId, "creating channels")
    if (result) {
      throw result
    }
    const groupPromise = ctx.prisma.group.findUnique({
      where: {
        id: input.id
      }
    })

    const groupOwnerPromise = ctx.prisma.group.findUnique({
      where: {
        id: input.id,
        ownerId: ctx.userId
      }
    })

    const [group, groupOwner] = await Promise.all([groupPromise, groupOwnerPromise])

    if (!group) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" })
    }

    if (!groupOwner) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to create channels in this group" })
    }

    const channel = await ctx.prisma.groupSubcategory.create({
      data: {
        name: input.name,
        slug: tranformString(input.name),
        type: input.newChannelType,
        group: {
          connect: {
            id: input.id
          }
        }
      }
    })

    return channel
  }),

  updateChannel: loggedInProcedure.input(channelUpdateSchema).mutation(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("channelUpdate", ctx.userId, "updating channels")
    if (result) {
      throw result
    }

    const channel = await ctx.prisma.groupSubcategory.findUniqueOrThrow({
      where: {
        id: input.id
      },
      include: {
        group: {
          select: {
            ownerId: true
          }
        }
      }
    })

    if (channel.group.ownerId !== ctx.userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to update this channel" })
    }

    await ctx.prisma.groupSubcategory.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name
      }
    })

    return {
      success: true
    }
  }),
  deleteChannel: loggedInProcedure.input(channelDeleteSchema).mutation(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("channelDelete", ctx.userId, "deleting channels")
    if (result) {
      throw result
    }

    const channel = await ctx.prisma.groupSubcategory.findUniqueOrThrow({
      where: {
        id: input.id
      },
      include: {
        group: {
          select: {
            ownerId: true
          }
        }
      }
    })

    if (channel.group.ownerId !== ctx.userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to delete this channel" })
    }

    await ctx.prisma.groupSubcategory.delete({
      where: {
        id: input.id
      }
    })

    return {
      success: true
    }
  })
})