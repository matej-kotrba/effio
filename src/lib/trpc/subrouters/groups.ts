import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import { TRPCError } from "@trpc/server"
import { transformCategoryNameToSlug } from "~/lib/utils/groupTransform"

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const slug = transformStringIntoSlug(input.name, ctx.user!.name!)

    const existingPost = await ctx.prisma.group.findUnique({
      where: {
        slug: slug
      }
    })

    if (existingPost) {
      throw new TRPCError({ code: "CONFLICT", message: "Group with same owner and name already exists." })
    }

    const newGroup = await ctx.prisma.group.create({
      data: {
        name: input.name,
        description: input.description,
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
  getGroupByName: loggedInProcedure.input(z.object({
    id: z.string(),
    name: z.string(),
    includeUsers: z.boolean().optional(),
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
        users: input.includeUsers || false,
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
    subcategorySlug: z.string(),
    testId: z.string(),
    cursor: z.string().optional(),
    limit: z.number().optional(),
    select: z.object({
      email: z.boolean().optional(),
      emailVerified: z.boolean().optional(),
      id: z.boolean().optional(),
      image: z.boolean().optional(),
      name: z.boolean().optional(),
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
      },
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      include: {
        _count: {
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
        }
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
  })
})