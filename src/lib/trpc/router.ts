import { z } from "zod"
import { protectedRouter } from "./subrouters/protected";
import { recordsRouter } from "./subrouters/records";
import { procedure, router } from "./setup";


// Schema of template question type
const questionTemplateSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  slug: z.string(),
  properties: z.object({
    inputType: z.string().optional(),
    question: z.array(z.string()).optional(),
  }).and(z.record(z.unknown()))
})

export type QuestionTemplate = z.infer<typeof questionTemplateSchema>

export const appRouter = router({
  getTemplates: procedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.template.findMany()
    return templates
  }),
  getQuestionsTypes: procedure.query(async ({ ctx }) => {
    const questionsTypes = await ctx.prisma.questionType.findMany()
    // Manual check if the field is correct will be performed here because of the JSON field
    const result = []
    for (const questionType of questionsTypes) {
      const validationResult = questionTemplateSchema.passthrough().safeParse(questionType)
      if (validationResult.success) {
        result.push(validationResult.data)
      }
    }
    console.log(questionsTypes)
    // This needs to be converted to unkown because of the JSON field
    // But its 100% safe because of the manual check above
    return result
  }),
  getUserTestsById: procedure.input(z.object({
    id: z.string(),
    limit: z.number(),
    isPublished: z.boolean().optional(),
    cursor: z.string().optional(),
    tags: z.array(z.string()).optional(),
    searchQuery: z.string().optional(),
  })).query(async ({ ctx, input }) => {
    // let tests: TestFullType[] = []
    const groupTests = await ctx.prisma.test.findMany({
      where: {
        published: input.isPublished,
        ownerId: input.id,
        title: {
          contains: input.searchQuery ? input.searchQuery : undefined
        }
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
        tags: {
          include: {
            tag: true
          }
        },
        owner: true,
      },
      take: input.limit,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      orderBy: {
        updatedAt: "desc"
      }
    })

    return groupTests
  }),
  getTestById: procedure.input(z.object({
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
  getTags: procedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany({
      orderBy: {
        name: "asc"
      }
    })
    if (!tags) {
      return { success: false, message: "No tags found" }
    }

    return {
      success: true,
      tags
    }
  }),
  getPopularTests: procedure.input(z.object({
    take: z.number().optional(),
    cursor: z.string().optional(),
    tags: z.array(z.string()).optional(),
    searchQuery: z.string().optional(),
  })).query(async ({ ctx, input }) => {
    // let test = null
    // console.log(input.searchQuery)
    // if (!input.cursor) {
    //   test = await ctx.prisma.test.findFirst({
    //     orderBy: [
    //       {
    //         stars: "desc"
    //       },
    //       {
    //         updatedAt: "desc"
    //       }
    //     ],
    //     include: {
    //       tags: {
    //         include: {
    //           tag: true
    //         }
    //       },
    //       owner: true,
    //     },
    //     where: (input.tags || input.searchQuery) ? {
    //       tags: input.tags ? {
    //         some: {
    //           tag: {
    //             name: {
    //               in: input.tags
    //             }
    //           }
    //         }
    //       } : undefined,
    //       title: {
    //         contains: input.searchQuery,
    //       }
    //       // AND: {
    //       //   tags: {
    //       //     some: {
    //       //       name: {
    //       //         startsWith: "A"
    //       //       }
    //       //     }
    //       //   }
    //       // }
    //     } : undefined
    //   })
    // }

    // if (input.cursor === undefined && !test) return {
    //   success: true,
    //   message: "No tests found"
    // }

    const tests = await ctx.prisma.test.findMany({
      take: input.take || 8,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? {
        id: input.cursor
      } : undefined,
      orderBy: [
        {
          stars: "desc"
        },
        {
          updatedAt: "desc"
        }
      ],
      include: {
        testVersions: {
          take: 1
        },
        tags: {
          include: {
            tag: true
          }
        },
        owner: true,
      },
      where: (input.tags || input.searchQuery) ? {
        tags: input.tags ? {
          some: {
            tag: {
              name: {
                in: input.tags
              }
            }
          }
        } : undefined,
        title: {
          contains: input.searchQuery
        }
      } : undefined
    })


    if (!tests) return {
      success: false,
      message: "No tests found"
    }

    return {
      success: true,
      tests
    }
  }),
  protected: protectedRouter,
  records: recordsRouter,
})

export type Router = typeof appRouter