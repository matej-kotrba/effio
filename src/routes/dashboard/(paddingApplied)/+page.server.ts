import type { Session } from '@auth/core/types.js';
import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma';

type TestCreationActivity = {
  count: bigint;
  period: string;
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

    const [result, resultTestsTaken] = await Promise.all([resultPromise, resultTestsTakenPromise])

    // Fill in the motnhs with no activity
    for (let i = 0; i < result.length; i++) {
      if (result[+i + 1]) {
        const currentYear = +result[+i].period.slice(0, 4)
        const nextYear = +result[+i + 1].period.slice(0, 4)
        const currentMonth = +result[+i].period.slice(5, 7)
        const nextMonth = +result[+i + 1].period.slice(5, 7)

        let iterator = 0
        for (let k = 0; k < (nextYear - currentYear) * 12 + nextMonth - currentMonth - 1; k++) {
          result.splice(+i + 1 + iterator, 0, {
            count: 0n,
            period: `${currentYear + Math.floor((currentMonth + k) / 12)}-${String((currentMonth + k) % 12 + 1).padStart(2, '0')}`
          })
          iterator++
        }
      }
    }

    testCreationSummary = result

    for (let i = 0; i < resultTestsTaken.length; i++) {
      if (resultTestsTaken[+i + 1]) {
        const currentYear = +resultTestsTaken[+i].period.slice(0, 4)
        const nextYear = +resultTestsTaken[+i + 1].period.slice(0, 4)
        const currentMonth = +resultTestsTaken[+i].period.slice(5, 7)
        const nextMonth = +resultTestsTaken[+i + 1].period.slice(5, 7)

        let iterator = 0
        for (let k = 0; k < (nextYear - currentYear) * 12 + nextMonth - currentMonth - 1; k++) {
          resultTestsTaken.splice(+i + 1 + iterator, 0, {
            count: 0n,
            period: `${currentYear + Math.floor((currentMonth + k) / 12)}-${String((currentMonth + k) % 12 + 1).padStart(2, '0')}`
          })
          iterator++
        }
      }
    }

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
    throw redirect(302, `/?${query}`)
  }
}