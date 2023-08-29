import { z } from "zod"
import { loggedInProcedure, router } from "../setup"

export const recordsRouter = router({
  createTestRecord: loggedInProcedure.input(z.object({
    testId: z.string(),
    title: z.string(),
    description: z.string(),
    answerContent: z.array(
      z.object({
        questionId: z.string(),
        userContent: z.object({}).passthrough()
      })
    ),
  })).mutation(async ({ ctx, input }) => {
    console.log(input)
    if (input.answerContent.length === 0) {
      return {
        success: false,
      }
    }

    const createdTest = await ctx.prisma.testRecord.create({
      data: {
        userId: ctx.userId,
        testId: input.testId,
        title: input.title,
        description: input.description,
      }
    })

    if (!createdTest) {
      return {
        success: false,
      }
    }

    const questionResponse = await ctx.prisma.questionRecord.createMany({
      data: input.answerContent.map(item => {
        return {
          testRecordId: createdTest.id,
          questionId: item.questionId,
          content: item.userContent
        }
      })
    })

    if (!questionResponse) {
      return {
        success: false,
      }
    }

    return {
      success: true
    }
  }),
  getUserRecords: loggedInProcedure.input(z.object({
    id: z.string(),
    limit: z.number().optional(),
    skip: z.number().optional(),
  })).query(async ({ ctx, input }) => {
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
        id: input.id
      },
      include: {
        test: {
          include: {
            questions: {
              include: {
                type: true
              }
            },
            testGroup: true
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