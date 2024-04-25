import { z } from "zod"
import { protectedRouter } from "./subrouters/protected";
import { recordsRouter } from "./subrouters/records";
import { groupMessagesRouter } from "./subrouters/groupMessages"
import { procedure, router } from "./setup";
import { groupsRouter } from "./subrouters/groups";
import { groupInvitesRouter } from "./subrouters/groupInvite";
import { adminRouter } from "./subrouters/admin/router"
import { type Prisma, QuestionTypeSlug, type QuestionType } from "@prisma/client"
import { redis } from "~/lib/server/redis/redis"
import { USER_SLUG_MATCHER } from "~helpers/constants";

type QuestionSlugs = keyof typeof QuestionTypeSlug

// Schema of template question type
const questionTemplateSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  slug: z.enum<QuestionSlugs, [QuestionSlugs, ...QuestionSlugs[]]>(Object.keys(QuestionTypeSlug) as [QuestionSlugs, ...QuestionTypeSlug[]]),
})

export type QuestionTemplate = z.infer<typeof questionTemplateSchema>

export const appRouter = router({
  getTemplates: procedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.template.findMany()
    return templates
  }),
  getQuestionsTypes: procedure.input(z.object({
    onlyRegular: z.boolean().optional(),
    onlyProgramming: z.boolean().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    let questionsTypes: QuestionType[]

    if (input === undefined || input.onlyRegular === true && input.onlyProgramming === true) {
      questionsTypes = await ctx.prisma.questionType.findMany()
    }
    else if (input.onlyRegular === true) {
      questionsTypes = await ctx.prisma.questionType.findMany({
        where: {
          type: "REGULAR"
        }
      })
    }
    else if (input.onlyProgramming === true) {
      questionsTypes = await ctx.prisma.questionType.findMany({
        where: {
          type: "PROGRAMMING"
        }
      })
    }
    else return []

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
        stars: {
          _count: "desc"
        }
      },
      {
        updatedAt: "desc"
      }
    ] as const : [
      {
        updatedAt: "desc"
      },
      {
        stars: {
          _count: "desc"
        }
      },
    ] as const

    const groupTests = await ctx.prisma.test.findMany({
      where: {
        published: input.isPublished === false && input.id !== ctx.user?.id ? false : true,
        isPublic: input.id === ctx.user?.id ? undefined : true,
        ownerId: input.id,
        title: {
          contains: input.searchQuery ? input.searchQuery : undefined
        }
      },
      include: {
        _count: {
          select: {
            stars: true
          }
        },
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
  // TODO: Might be limited to only accessable test by specific user
  getTestById: procedure.input(z.object({
    id: z.string(),
    includeGroupSubcategories: z.boolean().optional()
  })).query(async ({ ctx, input }) => {
    const test = await ctx.prisma.test.findUnique({
      where: {
        id: input.id,
      },
      include: {
        _count: {
          select: {
            stars: true
          }
        },
        subcategories: input.includeGroupSubcategories || false,
        owner: true,
        tags: {
          include: {
            tag: true
          }
        },
        stars: ctx.user?.id ? {
          select: {
            userId: true,
            testId: true
          },
          where: {
            userId: ctx.user?.id
          }
        } : undefined,
        testVersions: {
          include: {
            questions: {
              include: {
                type: true
              }
            },
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
  getTagss: procedure.query(async ({ ctx }) => {
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
  getTestViewCount: procedure.input(z.object({
    testId: z.string(),
    userId: z.string().optional()
  })).query(async ({ ctx, input }) => {
    const count = await ctx.prisma.test.findUnique({
      where: {
        id: input.testId,
      },
      include: {
        testVersions: {
          orderBy: {
            "createdAt": "desc"
          },
          take: 1,
          include: {
            _count: {
              select: {
                records: {
                  where: {
                    userId: input.userId
                  }
                }
              }
            }
          }
        }
      }
    })

    return count?.testVersions[0]?._count.records || 0
  }),
  getPopularTests: procedure.input(z.object({
    take: z.number().optional(),
    cursor: z.string().optional(),
    tags: z.array(z.string()).optional(),
    searchQuery: z.string().optional(),
    timePeriod: z.enum(["day", "week", "two-weeks", "month", "year"]).optional(),
    shouldORtags: z.boolean().optional(),
    excludedTests: z.array(z.string()).optional()
  })).query(async ({ ctx, input }) => {

    type TestsType = Prisma.TestGetPayload<{
      include: {
        _count: {
          select: {
            stars: true
          }
        },
        owner: true,
        testVersions: true,
        tags: {
          include: {
            tag: true
          }
        },
        stars: {
          select: {
            userId: true,
            testId: true
          }
        }
      }
    }>

    const redisCacheString = `popular-tests${input.searchQuery || (input.tags && input.tags?.length > 0) ? "?" : ""}:${input.searchQuery ? input.searchQuery : ""}:${input.tags ? input.tags.join("&") : ""}:${input.cursor || 0}`

    const cached = await redis.get(redisCacheString)

    if (cached) {
      return {
        success: true,
        tests: cached as TestsType[]
      }
    }

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
          stars: {
            _count: "desc"
          }
        },
        {
          updatedAt: "desc"
        }
      ],
      include: {
        _count: {
          select: {
            stars: true
          }
        },
        testVersions: {
          take: 1
        },
        tags: {
          include: {
            tag: true,
          }
        },
        owner: true,
        stars: ctx.user?.id ? {
          select: {
            userId: true,
            testId: true
          },
          where: {
            userId: ctx.user?.id
          }
        } : undefined
      },
      where: {
        id: {
          notIn: input.excludedTests || []
        },
        published: true,
        isPublic: true,
        createdAt: dateRange ? {
          gte: dateRange
        } : undefined,
        [input.shouldORtags ? "OR" : "AND"]: input.tags ? input.tags.map(tag => ({
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

    if (!tests) return {
      success: false,
      message: "No tests found"
    }

    redis.set(redisCacheString, tests, {
      ex: 20
    })

    return {
      success: true,
      tests
    }
  }),
  getUserBySlug: procedure.input(z.string().regex(USER_SLUG_MATCHER)).query(async ({ ctx, input }) => {
    // Slug is in format of `{string}[n]@{string}[4]`, spaces replaced by "-"

    const user = await ctx.prisma.user.findUnique({
      where: {
        slug: input
      },
    })

    const testsCreated = ctx.prisma.test.count({
      where: {
        ownerId: user?.id,
        published: true
      }
    })

    const starsApplied = ctx.prisma.testStar.count({
      where: {
        userId: user?.id
      }
    })

    return {
      user,
      testsCreated,
      starsApplied
    }
  }),
  protected: protectedRouter,
  records: recordsRouter,
  groups: groupsRouter,
  groupMessages: groupMessagesRouter,
  groupInvites: groupInvitesRouter,
  admin: adminRouter
})

export type Router = typeof appRouter