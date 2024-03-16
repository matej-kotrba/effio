import type { Session } from '@auth/core/types.js';
import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma';

type TestCreationActivity = {
  count: bigint;
  period: string;
}

type TestAvarageData = {
  count: number;
  maxPoints: string | number;
  userPoints: number;
}

function fillRecordsWithMissingMonths(records: TestCreationActivity[]) {
  for (let i = 0; i < records.length; i++) {
    if (records[+i + 1]) {
      const currentYear = +records[+i].period.slice(0, 4)
      const nextYear = +records[+i + 1].period.slice(0, 4)
      const currentMonth = +records[+i].period.slice(5, 7)
      const nextMonth = +records[+i + 1].period.slice(5, 7)

      let iterator = 0
      for (let k = 0; k < (nextYear - currentYear) * 12 + nextMonth - currentMonth - 1; k++) {
        records.splice(+i + 1 + iterator, 0, {
          count: 0n,
          period: `${currentYear + Math.floor((currentMonth + k) / 12)}-${String((currentMonth + k) % 12 + 1).padStart(2, '0')}`,
        })
        iterator++
      }
    }
    else if (i === records.length - 1) {
      const now = new Date()

      const currentYear = +records[+i].period.slice(0, 4)
      const nextYear = now.getFullYear()
      const currentMonth = +records[+i].period.slice(5, 7)
      const nextMonth = now.getMonth() + 1

      let iterator = 0
      for (let k = 0; k < (nextYear - currentYear) * 12 + nextMonth - currentMonth; k++) {
        records.splice(+i + 1 + iterator, 0, {
          count: 0n,
          period: `${currentYear + Math.floor((currentMonth + k) / 12)}-${String((currentMonth + k) % 12 + 1).padStart(2, '0')}`,
        })
        iterator++
      }
    }
  }

  // Filling the test to have atleast 5 months of records
  if (records.length < 5 && records.length > 0) {
    const currentYear = +records[0].period.slice(0, 4)
    const currentMonth = +records[0].period.slice(5, 7)

    for (let i = records.length; i < 5; i++) {
      records.unshift({
        count: 0n,
        period: `${currentMonth - i <= 0 ? currentYear - 1 : currentYear}-${String((currentMonth - i + 1) <= 0 ? 12 - currentMonth - i + 1 : currentMonth - i + 1).padStart(2, '0')}`,
      })
    }
  }
}

export const load = async (e) => {
  const { locals } = e
  const id = (await locals.getSession() as Session & { user: { id: string } })?.user?.id as string

  if (id) {
    const resultPromise: Promise<TestCreationActivity[]> = prisma.$queryRawUnsafe(`
    SELECT 
    COUNT(id) as "count",
    LEFT("createdAt"::text, 7) as "period"
    FROM "Test" 
    WHERE "ownerId" = $1
    GROUP BY LEFT("createdAt"::text, 7)
    ORDER BY LEFT("createdAt"::text, 7) ASC   
    `, id);

    const resultTestsTakenPromise: Promise<TestCreationActivity[]> = prisma.$queryRawUnsafe(`
    SELECT 
    COUNT(id) as "count",
    LEFT("createdAt"::text, 7) as "period"
    FROM "TestRecord"
    WHERE "userId" = $1
    GROUP BY LEFT("createdAt"::text, 7)
    ORDER BY LEFT("createdAt"::text, 7) ASC   
    `, id);

    const testAvaragePromise: Promise<TestAvarageData[]> = prisma.$queryRawUnsafe(`
      SELECT
        COUNT(DISTINCT tr.id)::int as "count",
        SUM(q.points)::float as "maxPoints",
        SUM(qr."userPoints")::float as "userPoints"
      FROM "User"
      JOIN "TestRecord" tr ON "User".id = tr."userId"
      JOIN "QuestionRecord" qr ON tr.id = qr."testRecordId"
      JOIN "Question" q ON qr."questionId" = q.id
      WHERE "User".id = $1
    `, id)

    const tagsTookTestFromPromise = prisma.$queryRawUnsafe(`
      SELECT
        COUNT(DISTINCT "tst".id)::int as "count",
        tag.name as "name"
      FROM "Test" tst
      JOIN "TagOnTests" tot ON "tst".id = tot."testId"
      JOIN "Tag" tag ON tot."tagId" = tag.id
      JOIN "TestVersion" t ON "tst".id = t."testId"
      JOIN "TestRecord" tr ON t.id = tr."testId"
      WHERE tr."userId" = $1
      GROUP BY tag.id
      ORDER BY tag.name ASC
    `, id)

    const getRecentCompletedTestsPromise = prisma.testRecord.findMany({
      where: {
        userId: id
      },
      include: {
        test: {
          include: {
            testGroup: {
              include: {
                _count: {
                  select: {
                    stars: true
                  }
                },
                owner: true,
                stars: {
                  select: {
                    userId: true,
                    testId: true
                  },
                  where: {
                    userId: id
                  }
                },
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        }
      },
      take: 3,
      distinct: ["title"],
      orderBy: {
        createdAt: "desc"
      }
    })
    const receivedStarsInLastMonthPromise = prisma.$queryRawUnsafe(`
      SELECT
        COUNT(DISTINCT "st".id)::int as "count"
      FROM "TestStar" st
      JOIN "Test" tst ON "tst".id = "st"."testId"
      WHERE "tst"."ownerId" = $1 AND LEFT(st."createdAt"::text, 4)::int * 12 * 30 + RIGHT(LEFT(st."createdAt":: text, 7), 2):: int * 30 + RIGHT(LEFT(st."createdAt":: text, 10), 2):: int <= LEFT(NOW()::text, 4):: int * 12 * 30 + RIGHT(LEFT(NOW()::text, 7), 2):: int * 30 + RIGHT(LEFT(NOW()::text, 10), 2):: int
    `, id)

    const gaveStarsInLastMonthPromise = prisma.$queryRawUnsafe(`
      SELECT
        COUNT(DISTINCT "st".id)::int as "count"
      FROM "TestStar" st
      WHERE "st"."userId" = $1 AND LEFT("st"."createdAt"::text, 4)::int * 12 * 30 + RIGHT(LEFT("st"."createdAt"::text, 7), 2)::int * 30 + RIGHT(LEFT(st."createdAt"::text, 10), 2)::int <= LEFT(NOW()::text, 4)::int * 12 * 30 + RIGHT(LEFT(NOW()::text, 7), 2)::int * 30 + RIGHT(LEFT(NOW()::text, 10), 2)::int
    `, id)

    const [result, resultTestsTaken, testAvarage, tagsTookTestFrom, getRecentCompletedTests, receivedStarsInLastMonth, gaveStarsInLastMonth] = await Promise.all([resultPromise, resultTestsTakenPromise, testAvaragePromise, tagsTookTestFromPromise, getRecentCompletedTestsPromise, receivedStarsInLastMonthPromise, gaveStarsInLastMonthPromise])

    // Fill in the motnhs with no activity
    fillRecordsWithMissingMonths(result)

    fillRecordsWithMissingMonths(resultTestsTaken)

    return {
      testCreationData: result,
      testTakenData: resultTestsTaken,
      testAvarageResult: { ...testAvarage[0], maxPoints: +testAvarage[0].maxPoints } satisfies TestAvarageData,
      tagsTookTestFromResult: tagsTookTestFrom as { count: number, name: string }[],
      recentlyCompletedTests: getRecentCompletedTests,
      receivedStarsInLastMonth: (receivedStarsInLastMonth as { count: number }[])[0],
      gaveStarsInLastMonth: (gaveStarsInLastMonth as { count: number }[])[0]
    }
  }
  else {
    redirect(307, "/")
  }
}


export const actions = {
  async logOut() {
    const query = "logout=true"
    throw redirect(307, `/?${query}`)
  }
}