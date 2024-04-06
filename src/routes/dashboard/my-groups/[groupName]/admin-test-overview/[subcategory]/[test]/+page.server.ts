import { fail, redirect, type ServerLoad } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms/server";
import prisma from "~/lib/prisma";
import { resetUsersAttemptsSchema } from "~/routes/dashboard/my-groups/schemas";

export const load: ServerLoad = async ({ params, }) => {

  const testId = params.test as string
  const subacategorySlug = params.subcategory as string

  if (!testId || !subacategorySlug) throw redirect(307, "/dashboard/my-groups")

  const resetUsersAttempts = superValidate(resetUsersAttemptsSchema)

  // const totalForEachQuestion = await prisma.question.findMany({
  //   where: {
  //     test: {
  //       testId: testId,
  //       id: test.testVersions[0].id
  //     },
  //   },
  //   select: {
  //     id: true,
  //     points: true,
  //     title: true,
  //   }
  // })

  // type QuestionData = {
  //   title: string;
  //   averagePoints: number;
  //   totalPoints: number;
  // }

  // const pointsQuestionData = (avarageForEachQuestion.map((question) => {
  //   const total = totalForEachQuestion.find((total) => total.id === question.questionId)
  //   if (!question._avg.userPoints || !total?.points) return null
  //   return {
  //     title: total.title,
  //     averagePoints: question._avg.userPoints,
  //     totalPoints: total.points
  //   }
  // })).filter(data => data !== null) as QuestionData[]

  const testsUserRecordsPromise = prisma.testRecord.findMany({
    where: {
      test: {
        testId: testId
      },
      subcategory: {
        slug: subacategorySlug
      },
      shouldCountToStatistics: true
    },
    select: {
      createdAt: true,
      userPoints: true,
      userId: true,
      test: {
        select: {
          totalPoints: true,
          markSystemJSON: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const testUsersRecordsDistinctCountPromise = prisma.$queryRaw`
    SELECT COUNT(DISTINCT "userId") as "count"
    FROM "TestRecord"
    JOIN "TestVersion" ON "TestRecord"."testId" = "TestVersion"."id"
    JOIN "Test" ON "TestVersion"."testId" = "Test"."id"
    JOIN "GroupSubcategory" ON "TestRecord"."subacategoryId" = "GroupSubcategory"."id"
    WHERE "Test"."id" = ${testId}
    AND "GroupSubcategory"."slug" = ${subacategorySlug}
    AND "TestRecord"."shouldCountToStatistics" = true
  `

  const [testsUserRecords, testUsersRecordsDistinctCount] = await Promise.all([testsUserRecordsPromise, testUsersRecordsDistinctCountPromise])

  const retypedCount = ((testUsersRecordsDistinctCount as { count: bigint }[]))
  const returnedCount = retypedCount[0].count > 0 ? Number(retypedCount[0].count) : 0

  const avaragePercentageScore = testsUserRecords.reduce((acc, record) => acc + record.userPoints / record.test.totalPoints, 0) / testsUserRecords.length

  return {
    resetUsersAttempts,
    testRecords: testsUserRecords,
    avarage: avaragePercentageScore * 100,
    count: returnedCount,
    subcategorySlug: subacategorySlug,
    testId: testId,
  }
}

export const actions = {
  resetUsersAttempts: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, resetUsersAttemptsSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    await prisma.groupSubcategoryOnTests.update({
      where: {
        testId_subcategoryId: {
          testId: form.data.testId,
          subcategoryId: form.data.subcategoryId
        }
      },
      data: {
        resetDate: new Date()
      }
    })

    return { form }
  }
}