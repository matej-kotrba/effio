import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import type { Prisma, TagOnTests, TestType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { questionContentFunctions } from "~helpers/test/questionFunctions"
import { ratelimit } from "~/lib/server/redis/redis"

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
    testType: z.enum(["REGULAR", "PROGRAMMING"]).default("REGULAR"),
    imageUrl: z.string().optional(),
    includedInGroups: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    isRandomized: z.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    let questions;
    try {
      questions = JSON.parse(input.questionContent) as QuestionClient[]
    }
    catch (e) {
      return {
        success: false
      }
    }

    try {
      const { success, reset } = await ratelimit.testCreation.limit(
        ctx.userId
      )

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", "message": `Hold up there pal!\n You are creating tests too fast, please wait ${(reset - Date.now()) / 1000}s and try again.` })
      }
    }
    catch { 0 }

    const isPublic = input.includedInGroups ? input.includedInGroups.includes("public") : true
    const includedInGroups = input.includedInGroups ? input.includedInGroups.filter(item => item !== "public") : []

    const legitGroupsCount = await ctx.prisma.groupSubcategory.count({
      where: {
        id: {
          in: includedInGroups
        },
        group: {
          users: {
            some: {
              userId: ctx.userId
            }
          }
        }
      }
    })

    if (legitGroupsCount !== includedInGroups.length) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to create a test in group you are not part of" })
    }

    const testGroupData = await ctx.prisma.test.create({
      data: {
        ownerId: ctx.userId,
        published: input.isPublished,
        title: input.title,
        description: input.description,
        isPublic: isPublic,
        imageUrl: input.imageUrl,
        type: input.testType,
        randomQuestionOrder: !!input.isRandomized,
        testVersions: {
          create: {
            version: 1,
            markSystemJSON: input.markSystem?.marks ?? {},
            totalPoints: questions.reduce((acc, item) => acc + item.points, 0),
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

    if (input.tagIds && input.tagIds?.length !== 0) {
      await ctx.prisma.tagOnTests.createMany({
        data: input.tagIds.map((tagId) => {
          return {
            tagId: tagId,
            testId: testGroupData.id,
          } satisfies PartialPick<TagOnTests, "id">
        })
      })
    }

    await ctx.prisma.$transaction([
      ctx.prisma.groupSubcategoryOnTests.createMany({
        data: includedInGroups.map((subcategoryId) => {
          return {
            subcategoryId,
            testId: testGroupData.id
          }
        })
      }),
      ctx.prisma.groupSubcategoryMessage.createMany({
        data: includedInGroups.map((subcategoryId) => {
          return {
            senderId: ctx.userId,
            messageType: "MESSAGE",
            title: "Added new test " + testGroupData.title,
            groupSubcategoryId: subcategoryId,
            testId: testGroupData.id
          }
        })
      })
    ])


    return {
      test: testGroupData.testVersions[0],
      questions: testGroupData.testVersions[0].questions,
      success: true
    }

  }),
  updateTest: loggedInProcedure.input(z.object({
    testGroupId: z.string(),
    title: z.string(),
    description: z.string(),
    questionContent: z.string(),
    isPublished: z.boolean(),
    imageUrl: z.string().optional(),
    markSystem: z.object({
      marks: z.array(z.object({
        name: z.string(),
        limit: z.number()
      })),
    }).optional(),
    tagIds: z.array(z.string()).optional(),
    includedInGroups: z.array(z.string()).optional(),
    isRandomized: z.boolean().optional()
  })).mutation(async ({ ctx, input }) => {

    try {
      const { success, reset } = await ratelimit.testUpdate.limit(
        ctx.userId
      )

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", "message": `Hold up there pal!\n You are updating tests too fast, please wait ${(reset - Date.now()) / 1000}s and try again.` })
      }
    }
    catch { 0 }

    const test = await ctx.prisma.test.findUnique({
      where: {
        id: input.testGroupId,
        ownerId: ctx.userId
      },
      include: {
        tags: true
      }
    })

    if (!test) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
    }

    // Tags
    const tagsToDelete = test.tags.filter(item => !input.tagIds?.includes(item.tagId))
    const tagsToCreate = input.tagIds?.filter(item => !test.tags.map(item => item.tagId).includes(item))

    try {

      const version = await ctx.prisma.testVersion.count({
        where: {
          testId: input.testGroupId
        }
      })

      const isPublic = input.includedInGroups ? input.includedInGroups.includes("public") : true
      const includedInGroups = input.includedInGroups ? input.includedInGroups.filter(item => item !== "public") : []

      const linkedGroups = await ctx.prisma.groupSubcategoryOnTests.findMany({
        where: {
          testId: input.testGroupId
        }
      })

      // Groups
      const linkedGroupsToDelete = linkedGroups.filter(item => !includedInGroups.includes(item.subcategoryId))
      const linkedGroupsToCreate = includedInGroups.filter(item => !linkedGroups.map(item => item.subcategoryId).includes(item))

      const legitGroupsCount = await ctx.prisma.groupSubcategory.count({
        where: {
          id: {
            in: linkedGroupsToCreate
          },
          group: {
            users: {
              some: {
                userId: ctx.userId
              }
            }
          }
        }
      })

      if (legitGroupsCount !== linkedGroupsToCreate.length) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to create a test in group you are not part of" })
      }

      // Creating and deleting messages, adding and removing test from groups
      await ctx.prisma.$transaction([
        ...linkedGroupsToDelete.map(({ id }) => {
          return ctx.prisma.groupSubcategoryOnTests.delete({
            where: {
              id
            }
          })
        }),
        ...linkedGroupsToCreate.map((subcategoryId) => {
          return ctx.prisma.groupSubcategoryOnTests.create({
            data: {
              testId: input.testGroupId,
              subcategoryId
            }
          })
        }),
        ctx.prisma.groupSubcategoryMessage.createMany({
          data: linkedGroupsToCreate.map((subcategoryId) => {
            return {
              senderId: ctx.userId,
              messageType: "MESSAGE",
              title: "Added new test: " + input.title,
              groupSubcategoryId: subcategoryId,
              testId: input.testGroupId
            }


          })
        }),
        ctx.prisma.groupSubcategoryMessage.createMany({
          data: linkedGroupsToDelete.map((item) => {
            return {
              senderId: ctx.userId,
              messageType: "MESSAGE",
              title: "Removed test: " + input.title,
              groupSubcategoryId: item.subcategoryId,
            }
          })
        })
      ])

      // Updating tags
      await ctx.prisma.$transaction([
        ...tagsToDelete.map(({ id }) => {
          return ctx.prisma.tagOnTests.delete({
            where: {
              id
            }
          })
        }),
        ...tagsToCreate?.map((item) => {
          return ctx.prisma.tagOnTests.create({
            data: {
              tagId: item,
              testId: input.testGroupId
            }
          })
        }) || [],
      ])

      const test = await ctx.prisma.test.update({
        where: {
          id: input.testGroupId
        },
        data: {
          title: input.title,
          description: input.description,
          isPublic,
          imageUrl: input.imageUrl,
          randomQuestionOrder: !!input.isRandomized,
        }
      })

      if (!test) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
      }

      const questions = JSON.parse(input.questionContent) as QuestionClient[]

      const testData = await ctx.prisma.testVersion.create({
        data: {
          testId: input.testGroupId,
          version: version + 1,
          markSystemJSON: input.markSystem?.marks ?? {},
          totalPoints: questions.reduce((acc, item) => acc + item.points, 0)
        }
      })

      if (!testData) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Test version not created" })
      }

      const questionsData =
        await ctx.prisma.question.createMany({
          data: questions.map((question) => {
            return {
              title: question.title,
              content: question.content,
              typeId: question.questionTypeId,
              testId: testData.id,
              points: question.points
            } as Prisma.QuestionCreateManyInput
          })
        })

      return {
        test: testData,
        questions: questionsData,
        success: true,
        testImage: test.imageUrl
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
      const { success, reset } = await ratelimit.testDeletion.limit(
        ctx.userId
      )

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", "message": `Hold up there pal!\n You are deleting tests too fast, please wait ${(reset - Date.now()) / 1000}s and try again.` })
      }
    }
    catch { 0 }
    try {
      const test = await ctx.prisma.test.findUnique({
        where: {
          id: input.testGroupId
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
          }
        }
      })

      if (!test) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Test was not found" })
      }

      if (test.ownerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to delete this test" })
      }

      // Call functions for deleting the questions (for example to remove images from storage bucket)
      for (const question of test.testVersions[0].questions) {
        // TODO: Later that question.content should be validated
        const typeCheckedFunction = questionContentFunctions[question.type.slug as keyof QuestionTypeMap].onActionWithDB
        if (typeCheckedFunction && question.content) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          typeCheckedFunction("delete", question.content)
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
  }),
  starTest: loggedInProcedure.input(z.object({
    testGroupId: z.string(),
    decrement: z.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const test = await ctx.prisma.test.findUnique({
      where: {
        id: input.testGroupId
      },
      select: {
        id: true,
        ownerId: true
      }
    })

    if (test === null) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
    }

    if (test.ownerId === ctx.userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to star your own test" })
    }

    let response;

    if (input.decrement === true) {
      response = await ctx.prisma.testStar.deleteMany({
        where: {
          userId: ctx.userId,
          testId: input.testGroupId
        }
      })
    }
    else {
      response = await ctx.prisma.testStar.create({
        data: {
          userId: ctx.userId,
          testId: input.testGroupId
        }
      })
    }

    return response
  })
})