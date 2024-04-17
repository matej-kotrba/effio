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

    const test = await ctx.prisma.testVersion.findUnique({
      where: {
        id: input.testId
      },
      include: {
        testGroup: {
          select: {
            published: true,
            ownerId: true
          }
        }
      }
    })

    if (!test) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
    }

    if (test.testGroup.published === false && ctx.user?.id !== test.testGroup.ownerId) {
      // Fore safety reasons
      throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
    }

    let subcategoryOwnerId: string | undefined = undefined;

    // Checking whether test is in subcategory and has limit, then check if user is in limit
    if (input.subcategoryId && ctx.user?.id) {
      const subcategory = await ctx.prisma.groupSubcategoryOnTests.findUnique({
        where: {
          testId_subcategoryId: {
            testId: test.testId,
            subcategoryId: input.subcategoryId
          },
          subcategory: {
            group: {
              users: {
                some: {
                  userId: ctx.user.id
                }
              }
            }
          }
        },
        include: {
          subcategory: {
            include: {
              group: {
                select: {
                  ownerId: true
                }
              }
            }
          }
        }
      })

      if (!subcategory) {
        throw new TRPCError({ code: "NOT_FOUND", message: "This channel with this test does not exist" })
      }

      if (subcategory.numberOfTries && ctx.user.id !== subcategoryOwnerId) {
        const createdLogsPromise = ctx.prisma.userSubcategoryTestStartLog.count({
          where: {
            userId: ctx.user.id,
            subcategoryId: input.subcategoryId,
            testId: test.testId
          }
        })

        const createdRecordsPromise = ctx.prisma.testRecord.count({
          where: {
            userId: ctx.user.id,
            subacategoryId: input.subcategoryId,
            test: {
              testId: test.testId
            },
            createdAt: subcategory.resetDate ? {
              gte: subcategory.resetDate
            } : undefined
          }
        })

        const [createdLogs, createdRecords] = await Promise.all([createdLogsPromise, createdRecordsPromise])

        if (createdRecords >= createdLogs) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You have no attempt created to record this test" })
        }
      }

      subcategoryOwnerId = subcategory.subcategory.group.ownerId
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
            data: input.answerContent.map((item, index) => {
              return {
                id: item.questionRecordId,
                questionId: item.questionId,
                content: item.userContent,
                userPoints: item.points,
                order: index
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
        test: {
          include: {
            testGroup: {
              select: {
                type: true,
              }
            }
          }
        }
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
              },
            }
          }
        },
        questionRecords: {
          orderBy: {
            order: "asc"
          },
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