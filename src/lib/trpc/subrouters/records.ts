import { z } from "zod"
import { loggedInProcedure, procedure, router } from "../setup"
import { TRPCError } from "@trpc/server"

export const recordsRouter = router({
  createTestRecord: procedure.input(z.object({
    testId: z.string(),
    title: z.string(),
    description: z.string(),
    subcategoryId: z.string().optional(),
    answerContent: z.array(
      z.object({
        questionId: z.string(),
        userContent: z.object({}).passthrough(),
        points: z.number(),
        questionRecordId: z.string().optional(),
      })
    ),
  })).mutation(async ({ ctx, input }) => {
    if (input.answerContent.length === 0) {
      return {
        success: false,
      }
    }

    let subcategoryOwnerId: string | undefined = undefined;

    if (input.subcategoryId && ctx.user?.id) {
      const subcategory = await ctx.prisma.groupSubcategory.findUnique({
        where: {
          id: input.subcategoryId,
          group: {
            users: {
              some: {
                userId: ctx.user.id
              }
            },
          }
        },
        include: {
          group: true
        }
      })

      if (!subcategory) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to create a test record in group you are not part of" })
      }

      subcategoryOwnerId = subcategory.group.ownerId
    }

    const createdTest = await ctx.prisma.testRecord.create({
      data: {
        userId: ctx.user?.id,
        testId: input.testId,
        title: input.title,
        description: input.description,
        subacategoryId: input.subcategoryId,
        shouldCountToStatistics: !!(input.subcategoryId && ctx.user?.id && ctx.user?.id !== subcategoryOwnerId),
        userPoints: input.answerContent.reduce((acc, curr) => acc + curr.points, 0),
        questionRecords: {
          createMany: {
            data: input.answerContent.map(item => {
              return {
                id: item.questionRecordId,
                questionId: item.questionId,
                content: item.userContent,
                userPoints: item.points,
              }
            })
          }
        }
      },
      include: {
        questionRecords: true
      }
    })

    if (!createdTest) {
      return {
        success: false,
      }
    }

    return {
      success: true,
      test: createdTest
    }
  }),
  getUserRecords: loggedInProcedure.input(z.object({
    id: z.string(),
    limit: z.number().optional(),
    skip: z.number().optional(),
  })).query(async ({ ctx, input }) => {
    if (input.id !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access other users records" })

    const records = await ctx.prisma.testRecord.findMany({
      take: input.limit || 10,
      skip: input.skip || 0,
      where: {
        userId: input.id
      },
      include: {
        test: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (!records) {
      return {
        success: false,
        records: []
      }
    }

    return {
      success: true,
      records: records
    }
  }),
  getTestRecordById: loggedInProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    const record = await ctx.prisma.testRecord.findUnique({
      where: {
        id: input.id,
        userId: ctx.userId
      },
      include: {
        test: {
          include: {
            questions: {
              include: {
                type: true
              }
            },
            testGroup: {
              include: {
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        },
        questionRecords: {
          include: {
            question: {
              include: {
                type: true
              }
            }
          }
        }
      }
    })

    if (!record) {
      return {
        success: false,
        record: null
      }
    }

    return {
      success: true,
      record
    }
  })
})