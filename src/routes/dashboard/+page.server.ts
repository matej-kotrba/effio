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
    `;

    summaryData = result
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