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

export const load = async ({ locals }) => {
  const id = (await locals.getSession() as Session & { user: { id: string } })?.user?.id as string

  if (id) {
    const resultPromise: Promise<TestCreationActivity[]> = prisma.$queryRaw`
    SELECT 
    COUNT(id) as "count",
    LEFT(createdAt, 7) as "period"
    FROM Test 
    WHERE ownerId = ${id}
    GROUP BY LEFT(createdAt, 7)
    ORDER BY LEFT(createdAt, 7) ASC   
    `;

    const resultTestsTakenPromise: Promise<TestCreationActivity[]> = prisma.$queryRaw`
    SELECT 
    COUNT(id) as "count",
    LEFT(createdAt, 7) as "period"
    FROM TestRecord
    WHERE userId = ${id}
    GROUP BY LEFT(createdAt, 7)
    ORDER BY LEFT(createdAt, 7) ASC   
    `;

    const testAvaragePromise: Promise<TestAvarageData[]> = prisma.$queryRaw`
      SELECT
        COUNT(DISTINCT tr.id) as "count",
        SUM(q.points) as "maxPoints",
        SUM(qr.userPoints) as "userPoints"
      FROM User user
      JOIN TestRecord tr ON user.id = tr.userId
      JOIN QuestionRecord qr ON tr.id = qr.testRecordId
      JOIN Question q ON qr.questionId = q.id
      WHERE user.id = ${id}
    `

    const tagsTookTestFromPromise = prisma.$queryRaw`
      SELECT
        COUNT(tr.id) as "count",
        tag.name as "name"
      FROM Test tst
      JOIN TagOnTests tot ON tst.id = tot.testId
      JOIN Tag tag ON tot.tagId = tag.id
      JOIN TestVersion t ON tst.id = t.testId
      JOIN TestRecord tr ON t.versionId = tr.testId
      WHERE tr.userId = ${id}
      GROUP BY tag.id
    `

    const [result, resultTestsTaken, testAvarage, tagsTookTestFrom] = await Promise.all([resultPromise, resultTestsTakenPromise, testAvaragePromise, tagsTookTestFromPromise])

    // Fill in the motnhs with no activity
    fillRecordsWithMissingMonths(result)

    fillRecordsWithMissingMonths(resultTestsTaken)

    return {
      testCreationData: result,
      testTakenData: resultTestsTaken,
      testAvarageResult: { ...testAvarage[0], maxPoints: +testAvarage[0].maxPoints } satisfies TestAvarageData,
      tagsTookTestFromResult: tagsTookTestFrom as { count: number, name: string }[]
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