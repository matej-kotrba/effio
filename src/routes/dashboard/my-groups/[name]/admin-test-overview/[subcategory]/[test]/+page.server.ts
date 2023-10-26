import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "~/lib/prisma";

export const load: ServerLoad = async ({ parent, params }) => {
  const testId = params.test as string
  const subacategorySlug = params.subcategory as string

  console.log(testId, subacategorySlug, params)
  if (!testId || !subacategorySlug) throw redirect(307, "/dashboard/my-groups")

  const test = await prisma.test.findUnique({
    where: {
      id: testId
    },
    include: {
      testVersions: {
        orderBy: {
          version: "desc"
        },
        take: 1,
        select: {
          totalPoints: true
        }
      }
    }
  })

  if (!test) {
    throw redirect(307, "/dashboard/my-groups")
  }

  const recordsAvg = await prisma.testRecord.aggregate({
    where: {
      test: {
        testId: testId
      },
      subcategory: {
        slug: subacategorySlug
      }
    },
    _avg: {
      userPoints: true
    },
    _count: true,
  })

  const avarageForEachQuestion = await prisma.questionRecord.groupBy({
    by: ["questionId"],
    where: {
      testRecord: {
        test: {
          testId: testId
        },
        subcategory: {
          slug: subacategorySlug
        }
      }
    },
    _avg: {
      userPoints: true
    },
  })

  const totalForEachQuestion = await prisma.question.findMany({
    where: {
      test: {
        testId: testId,
      }
    },
    select: {
      id: true,
      points: true
    }
  })

  const pointsQuestionData = (avarageForEachQuestion.map((question) => {
    const total = totalForEachQuestion.find((total) => total.id === question.questionId)
    console.log(total)
    if (!question._avg.userPoints || !total?.points) return null
    return {
      averagePoints: question._avg.userPoints,
      totalPoints: total.points
    }
  })).filter(data => data !== null) as {
    averagePoints: number;
    totalPoints: number;
  }[]

  return {
    avarage: recordsAvg._avg.userPoints,
    count: recordsAvg._count,
    totalPoints: test.testVersions[0].totalPoints,
    pointsQuestionData
  }
}  