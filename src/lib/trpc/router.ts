import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod"
import type { Context } from "./context";
import type { TestFullType } from "~/Prisma";

export const t = initTRPC.context<Context>().create()
export const router = t.router

// Schema of template question type
const schema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  properties: z.object({
    inputType: z.string(),
    question: z.array(z.string()),
  }).and(z.record(z.unknown()))
})

export type QuestionTemplate = z.infer<typeof schema>

const isLoggedIn = t.middleware(async (opts) => {
  if (!opts.ctx.user || !opts.ctx.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" })
  }
  return opts.next({
    ctx: {
      userId: opts.ctx.user.id as string
    }
  })
})

export const loggedInProcedure = t.procedure.use(isLoggedIn)

const protectedRouter = router({
  saveTest: loggedInProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    questionContent: z.string(),
    isPublished: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    try {

      const testData = await ctx.prisma.test.create({
        data: {
          title: input.title,
          description: input.description,
          ownerId: ctx.userId,
          published: input.isPublished,
        }
      })

      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      const questionsPromise = questions.map(async (question) => {
        return ctx.prisma.question.create({
          data: {
            title: question.title,
            content: question.content,
            typeId: question.questionTypeId,
            testId: testData.id,
          }
        })
      })

      const questionsData = await Promise.all(questionsPromise)

      return {
        test: testData,
        questions: questionsData,
        success: true
      }
    }
    catch (e) {
      return {
        success: false,
      }
    }
  }),
  updateTest: loggedInProcedure.input(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    questionContent: z.string(),
    isPublished: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    try {

      const testData = await ctx.prisma.test.update({
        where: {
          id: input.id
        },
        data: {
          title: input.title,
          description: input.description,
          ownerId: ctx.userId,
          published: input.isPublished,
        }
      })

      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      const questionsIds: string[] = questions.map(item => item.id)

      const questionsPromise = questions.map(async (question) => {
        questionsIds.push(question.id)
        return ctx.prisma.question.upsert({
          where: {
            id: question.id
          },
          update: {
            title: question.title,
            content: question.content,
          },
          create: {
            id: question.id,
            title: question.title,
            content: question.content,
            typeId: question.questionTypeId,
            testId: testData.id,
          }
        })
      })

      ctx.prisma.question.deleteMany({
        where: {
          id: {
            notIn: questionsIds
          }
        }
      })

      const questionsData = await Promise.all(questionsPromise)

      return {
        test: testData,
        questions: questionsData,
        success: true
      }
    }
    catch (e) {
      return {
        success: false,
      }
    }
  })
})

export const recordsRouter = router({
  createTestRecord: loggedInProcedure.input(z.object({
    testId: z.string(),
    answerContent: z.array(
      z.object({
        questionId: z.string(),
        questionContent: z.object({
          original: z.object({}).passthrough(),
          user: z.object({}).passthrough()
        })
      })
    ),
  })).mutation(async ({ ctx, input }) => {
    const createdTest = await ctx.prisma.testRecord.create({
      data: {
        userId: ctx.userId,
        testId: input.testId,
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
          content: item.questionContent
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
  })
})

export const appRouter = router({
  getTemplates: t.procedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.template.findMany()
    return templates
  }),
  getQuestionsTypes: t.procedure.query(async ({ ctx }) => {
    const questionsTypes = await ctx.prisma.questionType.findMany()
    // Manual check if the field is correct will be performed here because of the JSON field
    const result = []
    for (const questionType of questionsTypes) {
      const validationResult = schema.passthrough().safeParse(questionType)
      if (validationResult.success) {
        result.push(validationResult.data)
      }
    }
    // This needs to be converted to unkown because of the JSON field
    // But its 100% safe because of the manual check above
    return result
  }),
  getUserTestsById: t.procedure.input(z.object({
    id: z.string(),
    limit: z.number(),
    isPublished: z.boolean().optional(),
  })).query(async ({ ctx, input }) => {
    let tests: TestFullType[] = []
    tests = await ctx.prisma.test.findMany({
      where: {
        published: input.isPublished,
        ownerId: input.id,
      },
      include: {
        questions: {
          include: {
            type: true
          }
        },
        tags: true,
        owner: true
      },
      take: input.limit,
      orderBy: {
        updatedAt: "desc"
      }
    })
    return tests
  }),
  getTestById: t.procedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const test = await ctx.prisma.test.findUnique({
      where: {
        id: input.id
      },
      include: {
        questions: {
          include: {
            type: true
          }
        },
      }
    })

    if (!test) return null

    return test
  }),
  protected: protectedRouter,
  records: recordsRouter,
})

export type Router = typeof appRouter

// import type { RequestHandler } from "./$types"
// import { json } from "@sveltejs/kit"
// import { z } from "zod"

// const schemas = z.object({
//   title: z.string(),
//   description: z.string(),
//   questions: z.array(z.object({}).passthrough())
// })

// export const POST: RequestHandler = async ({ request, locals }) => {
//   if (!locals.getSession()) return json({ status: 403, body: "Unauthorized" })
//   const { body } = request
//   try {
//     schemas.parse(body)
//   }
//   catch (e) {
//     return json({ status: 400, body: e })
//   }
//   return json({ status: 200, body: "Hello World!" })
// }