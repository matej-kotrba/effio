import type { Session } from '@auth/core/types.js';
import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma';

type TestCreationActivity = {
  count: bigint;
  period: string;
}

export const load = async ({ locals }) => {
  const id = (await locals.getSession() as Session & { user: { id: string } })?.user?.id as string

  let summaryData;

  if (id) {
    const result: TestCreationActivity[] = await prisma.$queryRaw`
    SELECT 
    COUNT(id) as "count",
    LEFT(createdAt, 7) as "period" 
    FROM Test 
    WHERE ownerId = ${id}
    GROUP BY LEFT(createdAt, 7)
    ORDER BY LEFT(createdAt, 7) ASC   
    `;

    summaryData = result

    for (const i in summaryData) {
      if (summaryData[+i + 1]) {
        const currentYear = +summaryData[+i].period.slice(0, 4)
        const nextYear = +summaryData[+i + 1].period.slice(0, 4)
        const currentMonth = +summaryData[+i].period.slice(5, 7)
        const nextMonth = +summaryData[+i + 1].period.slice(5, 7)

        let iterator = 0
        for (let k = 0; k < (nextYear - currentYear) * 12 + nextMonth - currentMonth; k++) {
          summaryData.splice(+i + 1 + iterator, 0, {
            count: 0n,
            period: `${currentYear + Math.floor((currentMonth + k) / 12)}-${String((currentMonth + k) % 12 + 1).padStart(2, '0')}`
          })
          iterator++
          // for (let k = 1; k < +summaryData[+i + 1].period.slice(5, 7) - +summaryData[i].period.slice(5, 7); k++) {
          //   summaryData.splice(+i + 1, 0, {
          //     count: 0n,
          //     period: +summaryData[+i].period.slice(0, 4) + j + "-" + String((+summaryData[i].period.slice(5, 7) + k))
          //   })
          // }
        }
      }
    }
  }

  return {
    testCreationData: summaryData
  }
}


export const actions = {
  async logOut() {
    const query = "logout=true"
    throw redirect(302, `/?${query}`)
  }
}