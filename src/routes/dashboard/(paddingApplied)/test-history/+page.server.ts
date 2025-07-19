import { redirect } from '@sveltejs/kit'
import prisma from '~/lib/prisma.js'

export const load = async ({ locals }) => {
  const session = (await locals.getSession()) as UpdatedSession

  if (!session?.user?.id) redirect(307, '/login');
  const recordsCount = prisma.testRecord.count({
    where: {
      userId: session?.user ? session.user.id : null
    }
  })

  return {
    streaming: {
      recordsCount
    }
  }
}