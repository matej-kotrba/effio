import { z } from "zod"
import { loggedInProcedure, router } from "../setup"
import type { Prisma, TagOnTests, TestType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { questionContentFunctions } from "~helpers/test/questionFunctions"
import { ratelimit, trpcCheckForRateLimit } from "~/lib/server/redis/redis"
import { DB_STRING_REGEX } from "~helpers/constants"
import { includedInGroupsSchema } from "~schemas/testValidation"
import { PUSHER_APP_ID, PUSHER_SECRET } from "$env/static/private"
import { PUBLIC_PUSHER_CLUSTER, PUBLIC_PUSHER_KEY } from "$env/static/public"

const includedInGroupsInputSchema = z.object({ isPublic: z.boolean(), subcategorySelect: includedInGroupsSchema }).optional()

export const protectedRouter = router({
  saveTest: loggedInProcedure.input(z.object({
    title: z.string().regex(DB_STRING_REGEX),
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
    includedInGroups: includedInGroupsInputSchema,
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

    const result = await trpcCheckForRateLimit("testCreation", ctx.userId, "creating tests")
    if (result) {
      throw result
    }

    const isPublic = input.includedInGroups ? input.includedInGroups.isPublic : true
    const includedInGroups = input.includedInGroups ? input.includedInGroups.subcategorySelect : []

    const legitGroupsCount = await ctx.prisma.groupSubcategory.count({
      where: {
        id: {
          in: includedInGroups.map(item => item.id)
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
        data: includedInGroups.map((subcategory) => {
          return {
            subcategoryId: subcategory.id,
            testId: testGroupData.id,
            numberOfTries: subcategory.limit
          }
        })
      }),
      ctx.prisma.groupSubcategoryMessage.createMany({
        data: includedInGroups.map((subcategory) => {
          return {
            senderId: ctx.userId,
            messageType: "MESSAGE",
            title: "Added new test " + testGroupData.title,
            groupSubcategoryId: subcategory.id,
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
    title: z.string().regex(DB_STRING_REGEX),
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
    includedInGroups: includedInGroupsInputSchema,
    isRandomized: z.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const result = await trpcCheckForRateLimit("testUpdate", ctx.userId, "updating tests")
    if (result) {
      throw result
    }

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

      const isPublic = input.includedInGroups ? input.includedInGroups.isPublic : true
      const includedInGroups = input.includedInGroups ? input.includedInGroups.subcategorySelect : []

      const linkedGroups = await ctx.prisma.groupSubcategoryOnTests.findMany({
        where: {
          testId: input.testGroupId
        }
      })

      // Groups
      const linkedGroupsToDelete = linkedGroups.filter(item => !includedInGroups.map(item => item.id).includes(item.subcategoryId))
      const linkedGroupsToCreate = includedInGroups.filter(item => !linkedGroups.map(item => item.subcategoryId).includes(item.id))

      const legitGroupsCount = await ctx.prisma.groupSubcategory.count({
        where: {
          id: {
            in: linkedGroupsToCreate.map(item => item.id)
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
        ...includedInGroups.map((subcategory) => {
          return ctx.prisma.groupSubcategoryOnTests.upsert({
            where: {
              testId_subcategoryId: {
                subcategoryId: subcategory.id,
                testId: input.testGroupId
              },
            },
            update: {
              numberOfTries: subcategory.limit,
            },
            create: {
              testId: input.testGroupId,
              subcategoryId: subcategory.id,
              numberOfTries: subcategory.limit
            }
          })
        }),
        ctx.prisma.groupSubcategoryMessage.createMany({
          data: linkedGroupsToCreate.map((subcategory) => {
            return {
              senderId: ctx.userId,
              messageType: "MESSAGE",
              title: "Added new test: " + input.title,
              groupSubcategoryId: subcategory.id,
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
    const result = await trpcCheckForRateLimit("testDeletion", ctx.userId, "deleting tests")
    if (result) {
      throw result
    }

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
    const result = await trpcCheckForRateLimit("testStar", ctx.userId, "staring tests")
    if (result) {
      throw result
    }

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
  }),
  createTestAttempt: loggedInProcedure.input(z.object({
    testId: z.string(),
    subcategoryId: z.string()
  })).mutation(async ({ ctx, input }) => {
    //TODO: Add check if user is actually in the group

    const subcategoryOnTest = await ctx.prisma.groupSubcategoryOnTests.findUnique({
      where: {
        testId_subcategoryId: {
          subcategoryId: input.subcategoryId,
          testId: input.testId
        }
      },
      include: {
        test: true
      }
    })

    if (!subcategoryOnTest) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" })
    }

    if (subcategoryOnTest.test.ownerId === ctx.userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You cannot attempt your own test" })
    }

    const usersAttemptsCount = await ctx.prisma.userSubcategoryTestStartLog.count({
      where: {
        userId: ctx.userId,
        testId: input.testId,
        subcategoryId: input.subcategoryId
      }
    })

    if (subcategoryOnTest.numberOfTries !== null && usersAttemptsCount >= subcategoryOnTest.numberOfTries) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You have reached the limit of attempts" })
    }
    const testAttempts = await ctx.prisma.userSubcategoryTestStartLog.create({
      data: {
        userId: ctx.userId,
        testId: input.testId,
        subcategoryId: input.subcategoryId
      }
    })

    return {
      success: true
    }
  }),
  getTestsOfUser: loggedInProcedure.input(z.object({
    subcategoryId: z.string().optional()
  })).query(async ({ ctx, input }) => {
    return await ctx.prisma.test.findMany({
      where: {
        ownerId: ctx.userId
      },
      include: {
        subcategories: {
          where: {
            subcategoryId: input.subcategoryId
          },
          select: {
            id: true
          }
        }
      }
    })
  }),
  updateSubcategoryConnectionsToTest: loggedInProcedure.input(z.object({
    groupId: z.string(),
    subcategoryId: z.string(),
    testsToConnect: z.array(z.object({ id: z.string(), title: z.string() })),
    connectionsToDelete: z.array(z.object({ id: z.number(), testTitle: z.string(), subcategoryId: z.string() }))
  })).mutation(async ({ ctx, input }) => {

    const subcategory = await ctx.prisma.groupSubcategory.findUnique({
      where: {
        id: input.subcategoryId
      },
      select: {
        id: true
      }
    })

    if (!subcategory) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Channel not found" })
    }

    const [a, b, c, d] = await ctx.prisma.$transaction([
      ctx.prisma.groupSubcategoryOnTests.deleteMany({
        where: {
          id: {
            in: input.connectionsToDelete.map(item => item.id)
          }
        },
      }),

      ctx.prisma.groupSubcategoryOnTests.createMany({
        data: input.testsToConnect.map((item) => {
          return {
            testId: item.id,
            subcategoryId: input.subcategoryId
          }
        })
      }),
      ctx.prisma.groupSubcategoryMessage.createMany({
        data: input.testsToConnect.map((test) => {
          return {
            senderId: ctx.userId,
            messageType: "MESSAGE",
            title: "Added new test: " + test.title,
            groupSubcategoryId: subcategory.id,
            testId: test.id
          }
        })
      }),
      ctx.prisma.groupSubcategoryMessage.createMany({
        data: input.connectionsToDelete.map((item) => {
          return {
            senderId: ctx.userId,
            messageType: "MESSAGE",
            title: "Removed test: " + item.testTitle,
            groupSubcategoryId: item.subcategoryId,
          }
        })
      })
    ])

    // const pusher = new Pusher({
    //   appId: PUSHER_APP_ID,
    //   key: PUBLIC_PUSHER_KEY,
    //   secret: PUSHER_SECRET,
    //   cluster: PUBLIC_PUSHER_CLUSTER,
    //   useTLS: true,
    // });

    // await pusher.trigger(`group-${input.groupId}-${input.subcategoryId}`, "new-message", message);

    return { success: true }
  })
})