import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod"
import type { Context } from "./context";
import superjson from "superjson"

export const t = initTRPC.context<Context>().create(
  {
    transformer: superjson
  }
)
export const router = t.router

// Schema of template question type
const schema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  slug: z.string(),
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

      const testGroupData = await ctx.prisma.test.create({
        data: {
          ownerId: ctx.userId,
          published: input.isPublished,
        }
      })

      const testData = await ctx.prisma.testVersion.create({
        data: {
          title: input.title,
          description: input.description,
          version: 1,
          testId: testGroupData.id,
        }
      })

      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      // const questionData = questions.map(async (question) => {
      //   return ctx.prisma.question.create({
      //     data: {
      //       title: question.title,
      //       content: question.content,
      //       typeId: question.questionTypeId,
      //       testId: testData.versionId,
      //     }
      //   })
      // })

      const questionsData = await ctx.prisma.question.createMany({
        data: questions.map((question) => {
          return {
            title: question.title,
            content: question.content,
            typeId: question.questionTypeId,
            testId: testData.versionId,

          }
        })
      })

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
    testGroupId: z.string(),
    title: z.string(),
    description: z.string(),
    questionContent: z.string(),
    isPublished: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    try {

      const version = await ctx.prisma.testVersion.count({
        where: {
          testId: input.testGroupId
        }
      })

      console.log("VERSION", version)

      const testData = await ctx.prisma.testVersion.create({
        data: {
          title: input.title,
          description: input.description,
          testId: input.testGroupId,
          version: version + 1
        }
      })

      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      // TODO: use createMany
      const questionsPromise = questions.map(async (question) => {
        return ctx.prisma.question.create({
          data: {
            title: question.title,
            content: question.content,
            typeId: question.questionTypeId,
            testId: testData.versionId,
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
  deleteTest: loggedInProcedure.input(z.object({
    testGroupId: z.string(),
  })).mutation(async ({ ctx, input }) => {
    try {
      const test = await ctx.prisma.test.findUnique({
        where: {
          id: input.testGroupId
        }
      })

      if (!test) {
        return {
          success: false,
          message: "Test not found"
        }
      }

      if (test.ownerId !== ctx.userId) {
        return {
          success: false,
          message: "Unauthorized"
        }
      }

      const deleteTest = await ctx.prisma.test.delete({
        where: {
          id: input.testGroupId
        }
      })

      return {
        success: true,
        message: "Test deleted",
        test: deleteTest
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
    // let tests: TestFullType[] = []
    const groupTests = await ctx.prisma.test.findMany({
      where: {
        published: input.isPublished,
        ownerId: input.id,

      },
      include: {
        testVersions: {
          take: 1,
          orderBy: {
            version: "desc"
          },
          include: {
            questions: {
              include: {
                type: true
              }
            },
          }
        },
        tags: true,
        owner: true,
      },
      take: input.limit,
      orderBy: {
        updatedAt: "desc"
      }
    })

    return groupTests

    // tests = groupTests.map(test => {
    //   return {
    //     versionId: test.tests[0].versionId,
    //     createdAt: test.createdAt,
    //     updatedAt: test.updatedAt,
    //     title: test.tests[0].title,
    //     description: test.tests[0].description,
    //     questions: test.tests[0].questions,
    //     testGroup: {
    //       ...test
    //     },
    //     testId: test.id,
    //     version: test.tests[0].version,

    //     // id: test.id,
    //     // owner: test.owner,
    //     // ownerId: test.ownerId,
    //     // tags: test.tags,
    //     // published: test.published,
    //     // stars: test.stars,
    //     // createdAt: test.createdAt,
    //     // updatedAt: test.updatedAt,
    //     // title: test.tests[0].title,
    //     // description: test.tests[0].description,
    //     // questions: test.tests[0].questions,
    //     // version: test.tests[0].version,
    //     // testGroupId: test.tests[0].testId,
    //   }
    // })
  }),
  getTestById: t.procedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const test = await ctx.prisma.test.findUnique({
      where: {
        id: input.id
      },
      include: {
        owner: true,
        tags: true,
        testVersions: {
          include: {
            questions: {
              include: {
                type: true
              }
            }
          },
          orderBy: {
            version: "desc"
          },
          take: 1
        }
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