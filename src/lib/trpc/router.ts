import { z } from "zod"
import { protectedRouter } from "./subrouters/protected";
import { recordsRouter } from "./subrouters/records";
import { groupMessagesRouter } from "./subrouters/groupMessages"
import { procedure, router } from "./setup";
import { groupsRouter } from "./subrouters/groups";
import { groupInvitesRouter } from "./subrouters/groupInvite";

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
    order: z.enum(["stars", "date"]).optional()
  })).query(async ({ ctx, input }) => {
    const ordering = input.order === "stars" ? [
      {
        stars: "desc"
      },
      {
        createdAt: "desc"
      }
    ] as const : [
      {
        createdAt: "desc"
      },
      {
        stars: "desc"
      }
    ] as const

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
      orderBy: ordering as any
    })

    return groupTests
  }),
  getTestById: procedure.input(z.object({
    id: z.string(),
    includeGroupSubcategories: z.boolean().optional()
  })).query(async ({ ctx, input }) => {
    const test = await ctx.prisma.test.findUnique({
      // TODO: Might be limited to only accessable test by specific user
      where: {
        id: input.id,
      },
      include: {
        subcategories: input.includeGroupSubcategories || false,
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
      },
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
    timePeriod: z.enum(["day", "week", "two-weeks", "month", "year"]).optional()
  })).query(async ({ ctx, input }) => {

    const timeTable: {
      [key: string]: number
    } = {
      "day": 1,
      "week": 7,
      "two-weeks": 14,
      "month": 30,
      "year": 365,
    }

    let dateRange: Date | undefined = undefined;
    if (input.timePeriod) {
      dateRange = new Date();
      dateRange.setDate(dateRange.getDate() - timeTable[input.timePeriod]);
    }

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
      where: {
        createdAt: dateRange ? {
          gte: dateRange
        } : undefined,
        AND: input.tags ? input.tags.map(tag => ({
          tags: {
            some: {
              tag: {
                name: tag
              }
            },
          },
        })) : undefined,
        title: {
          contains: input.searchQuery
        }
      }
    })

    console.log(tests)

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
  groups: groupsRouter,
  groupMessages: groupMessagesRouter,
  groupInvites: groupInvitesRouter,
})

export type Router = typeof appRouter