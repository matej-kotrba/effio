import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import type { Prisma } from "@prisma/client"
import { TRPCError } from "@trpc/server"

export const protectedRouter = router({
  saveTest: loggedInProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    questionContent: z.string(),
    markSystem: z.object({
      marks: z.array(z.object({
        name: z.string(),
        limit: z.number()
      }))
    }).optional(),
    isPublished: z.boolean(),
    includedInGroups: z.array(z.string()).optional()
  })).mutation(async ({ ctx, input }) => {
    try {
      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      const isPublic = input.includedInGroups ? input.includedInGroups.includes("public") : true
      const includedInGroups = input.includedInGroups ? input.includedInGroups.filter(item => item !== "public") : []

      const testGroupData = await ctx.prisma.test.create({
        data: {
          ownerId: ctx.userId,
          published: input.isPublished,
          title: input.title,
          description: input.description,
          isPublic: isPublic,
          testVersions: {
            create: {
              version: 1,
              markSystemJSON: input.markSystem?.marks ?? {},
              questions: {
                createMany: {
                  data: questions.map((question) => {
                    return {
                      title: question.title,
                      content: question.content,
                      typeId: question.questionTypeId,
                      points: question.points
                    }
                  }) as PartialPick<Prisma.QuestionCreateManyInput, "testId" | "createdAt" | "updatedAt" | "id">[],
                }
              }
            },
          }
        },
        include: {
          testVersions: {
            include: {
              questions: true
            }
          }
        }
      })

      await ctx.prisma.groupOnTests.createMany({
        data: includedInGroups.map((groupId) => {
          return {
            groupId,
            testId: testGroupData.id
          }
        })
      })

      return {
        test: testGroupData.testVersions[0],
        questions: testGroupData.testVersions[0].questions,
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
    markSystem: z.object({
      marks: z.array(z.object({
        name: z.string(),
        limit: z.number()
      })),
    }).optional(),
    includedInGroups: z.array(z.string()).optional()
  })).mutation(async ({ ctx, input }) => {
    try {

      const version = await ctx.prisma.testVersion.count({
        where: {
          testId: input.testGroupId
        }
      })

      console.log("VERSION", version)

      const isPublic = input.includedInGroups ? input.includedInGroups.includes("public") : true
      const includedInGroups = input.includedInGroups ? input.includedInGroups.filter(item => item !== "public") : []

      const linkedGroups = await ctx.prisma.groupOnTests.findMany({
        where: {
          testId: input.testGroupId
        }
      })

      const linkedGroupsToDelete = linkedGroups.filter(item => !includedInGroups.includes(item.groupId))
      const linkedGroupsToCreate = includedInGroups.filter(item => !linkedGroups.map(item => item.groupId).includes(item))

      await ctx.prisma.$transaction([
        ...linkedGroupsToDelete.map(({ id }) => {
          return ctx.prisma.groupOnTests.delete({
            where: {
              id
            }
          })
        }),
        ...linkedGroupsToCreate.map((groupId) => {
          return ctx.prisma.groupOnTests.create({
            data: {
              testId: input.testGroupId,
              groupId
            }
          })
        })
      ])

      const test = await ctx.prisma.test.update({
        where: {
          id: input.testGroupId
        },
        data: {
          title: input.title,
          description: input.description,
          isPublic,
        }
      })

      if (!test) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
      }

      const testData = await ctx.prisma.testVersion.create({
        data: {
          testId: input.testGroupId,
          version: version + 1,
          markSystemJSON: input.markSystem?.marks ?? {},
        }
      })

      if (!testData) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Test version not created" })
      }

      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      const questionsData =
        await ctx.prisma.question.createMany({
          data: questions.map((question) => {
            return {
              title: question.title,
              content: question.content,
              typeId: question.questionTypeId,
              testId: testData.versionId,
              points: question.points
            } as Prisma.QuestionCreateManyInput
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