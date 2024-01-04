import type { Session } from '@auth/core/types.js';
import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma';

type TestCreationActivity = {
  count: bigint;
  period: string;
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

  let testCreationSummary;
  let testTakenSummary;

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

    // const tagsTookTestFrom = prisma.$queryRaw`
    //   SELECT
    //   COUNT(id) as "count",
    //   FROM TestRecord tr
    //   JOIN Test t ON tr.test_id = t.id
    //   WHERE userId = ${id}
    //   GROUP BY test.testGroup.tags
    // `

    const [result, resultTestsTaken] = await Promise.all([resultPromise, resultTestsTakenPromise])

    console.log(result, resultTestsTaken)

    // Fill in the motnhs with no activity
    fillRecordsWithMissingMonths(result)

    testCreationSummary = result

    fillRecordsWithMissingMonths(resultTestsTaken)

    testTakenSummary = resultTestsTaken
  }

  return {
    testCreationData: testCreationSummary,
    testTakenData: testTakenSummary
  }
}


export const actions = {
  async logOut() {
    const query = "logout=true"
    throw redirect(307, `/?${query}`)
  }
}